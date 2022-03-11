package com.getcapacitor;

import android.content.Context;
import android.content.Intent;
import android.app.Activity;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.DocumentsContract;
import android.text.TextUtils;
import android.webkit.URLUtil;

import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.contract.ActivityResultContract;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PipedInputStream;
import java.io.PipedOutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * An {@link ActivityResultContract} to {@link Activity#requestPermissions request a permission}
 */
public class DownloadJSActivity extends ActivityResultContract<DownloadJSActivity.Input, Boolean> {

    public static class Input {
        public String fileNameURL;
        public String optionalMimeType;
        public String contentDisposition;
        public String operationID;
        public Input(String operationID, String fileNameURL, String optionalMimeType, String contentDisposition) {
            this.operationID = operationID;
            this.fileNameURL = fileNameURL;
            this.optionalMimeType = optionalMimeType;
            this.contentDisposition = contentDisposition;
        }
    }
    public class OperationStatus {
        public Input input;
        public String fullDestinationPath;
        public String destinationFileName;
        public PipedOutputStream outStream;
        public PipedInputStream inStream;
            //state
        public Boolean closed;
        public Boolean started;
        public Boolean pendingClose;
        public Boolean failureClose;
        //
        public OperationStatus(Input input, String[] paths) {
            this.input = input;
            this.fullDestinationPath = paths[0];
            this.destinationFileName = paths[1];
            this.closed = this.started = this.pendingClose = this.failureClose = false;
            this.outStream = new PipedOutputStream();
            try {
                this.inStream = new PipedInputStream();
                this.inStream.connect(this.outStream);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private static String EXTRA_OPERATION_ID = "OPERATION_ID";

    private AppCompatActivity activity;
    private HashMap<String, OperationStatus> operations;
    private OperationStatus pendingOperation;


    public DownloadJSActivity(AppCompatActivity activity) {
        this.activity = activity;
        this.operations = new HashMap<String, OperationStatus>();
    }

    /* public */
    public void appendToOperation(String operationID, String data) {
        //get operation status
        Logger.debug("A", operationID);
        OperationStatus operationStatus = this.operations.get(operationID);
        if (operationStatus == null && this.pendingOperation.input.operationID.equals(operationID)) operationStatus = this.pendingOperation;
        if (operationStatus == null || operationStatus.closed) return; //already closed?
        Logger.debug("BV");
        //write
        try {
            operationStatus.outStream.write(data.getBytes());
        } catch (IOException e) {
            Logger.debug(e.toString());
        }
        Logger.debug("Wrote!");
    }
    public void failOperation(String operationID) {
        //get operation status
        OperationStatus operationStatus = this.operations.get(operationID);
        if (operationStatus == null && this.pendingOperation.input.operationID.equals(operationID)) operationStatus = this.pendingOperation;
        if (operationStatus == null || operationStatus.closed) return; //already closed?
        //Ask for close
        operationStatus.failureClose = true;
        operationStatus.pendingClose = true;
    }
    public void completeOperation(String operationID) {
        //get operation status
        OperationStatus operationStatus = this.operations.get(operationID);
        if (operationStatus == null && this.pendingOperation.input.operationID.equals(operationID)) operationStatus = this.pendingOperation;
        if (operationStatus == null || operationStatus.closed) return; //already closed?
        //Ask for close
        operationStatus.pendingClose = true;
    }


    /* ActivityResultContract Implementation */
    public Intent createIntent(@NonNull Context context, DownloadJSActivity.Input input) {
        //ask path
        String[] paths = this.getUniqueDownloadFileNameFromDetails(input.fileNameURL, input.optionalMimeType, input.contentDisposition, null);
        if (paths == null) return null;
        //Create/config intent to prompt for file selection
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.putExtra(Intent.EXTRA_TITLE, paths[1]);
        intent.putExtra(EXTRA_OPERATION_ID, input.operationID);

        if (input.optionalMimeType != null) intent.setType(input.optionalMimeType);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) intent.putExtra(DocumentsContract.EXTRA_INITIAL_URI, paths[0]);
        //Add operation
        this.pendingOperation = new OperationStatus(input, paths);
        //
        return intent;
    }
    public Boolean parseResult(int resultCode, @Nullable Intent result) {
        //get operation status
        OperationStatus operationStatus = this.pendingOperation;
        if (operationStatus == null) return false; //double call?
        //Reset pointer
        this.pendingOperation = null;
        //
        Logger.debug("Code", String.valueOf(resultCode));
        if (resultCode == Activity.RESULT_OK) {
            this.operations.put(operationStatus.input.operationID, operationStatus);
            this.createPipeForOperation(operationStatus, result.getData());
            return true;
        } else if (resultCode == Activity.RESULT_CANCELED){
            //todo: close all
            return false;
        } return false;
    }

    //
    private void createPipeForOperation(OperationStatus operationStatus, Uri uri) {
        //check for operation finished
        if (operationStatus.started || operationStatus.closed) return;
        //
        operationStatus.started = true;
        //
        try {
            OutputStream output = this.activity.getContentResolver().openOutputStream(uri);
            int offset = 0;
            while (!operationStatus.closed) {
                //Have what to read?
                int toRead = Math.min(operationStatus.inStream.available(), 64 * 1024);
                Logger.debug("To read", String.valueOf(toRead));
                if (toRead <= 0) {
                    if (operationStatus.pendingClose) operationStatus.closed = true;
                    continue;
                }
                //
                byte[] bytes = new byte[toRead];
                operationStatus.inStream.read(bytes, offset, toRead);
                output.write(bytes);
                offset += toRead - 1;
            }
            output.flush();
            output.close();
            Logger.debug("done pipe");
            // Tell the media scanner about the new file so that it is
            // immediately available to the user.
            MediaScannerConnection.scanFile(this.activity,
                    new String[] { uri.toString() }, null,
                    new MediaScannerConnection.OnScanCompletedListener() {
                        public void onScanCompleted(String path, Uri uri2) {
                            Logger.debug("ExternalStorage", "Scanned " + path + ":");
                            Logger.debug("ExternalStorage", "-> uri=" + uri2);
                        }
                    });

        } catch (IOException e) {
            Logger.debug("onActivityResult: ", e.toString());
        }
    }


    /* FS Utils */
    private String getDownloadFilePath(String fileName) {
        return Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).getAbsolutePath() + '/' + fileName;
    }
    private Boolean checkCreateDefaultDir() {
        Boolean created = false;
        try {
            File dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            if (!dir.exists()) dir.mkdir();
            created = true;
        } catch (RuntimeException e) {
            Logger.debug("Error while creating default download dir:", e.toString());
        }
        return created;
    }
    private String[] getUniqueDownloadFileNameFromDetails(String fileDownloadURL, String optionalCD, String optionalMimeType, @Nullable Integer optionalSuffix) {
        //Auxs for filename gen.
        String suggestedFilename = URLUtil.guessFileName(fileDownloadURL, optionalCD, optionalMimeType);
        ArrayList<String> fileComps = new ArrayList<String>(Arrays.asList(suggestedFilename.split(".")));
        String suffix =  (optionalSuffix != null ? " (" + String.valueOf(optionalSuffix) + ")" : "");
        //Check for invalid filename
        if (suggestedFilename == null || suggestedFilename.length() <= 0) suggestedFilename = UUID.randomUUID().toString();
        //Generate filename
        String fileName = "";
        if (fileComps.size() > 1) {
            String fileExtension = "." + fileComps.remove(fileComps.size() - 1);
            fileName = TextUtils.join(".", fileComps) + suffix + fileExtension;
        } else {
            fileName = suggestedFilename + suffix;
        }
        //Check for default dir (might not exists per official documentation)
        if (!this.checkCreateDefaultDir()) return null;
        //Check if file with generated name exists
        String fullPath = this.getDownloadFilePath(fileName);
        //File picker should do this for us
//        File file = new File(fullPath);
//        if (file.exists()) {
//            Integer nextSuffix = (optionalSuffix != null ? optionalSuffix + 1 : 1);
//            return this.getUniqueDownloadFileNameFromDetails(fileDownloadURL, optionalCD, optionalMimeType, nextSuffix);
//        }
        return new String[]{fullPath, fileName};
    }
}
