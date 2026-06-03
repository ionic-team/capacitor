package com.getcapacitor;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.DocumentsContract;
import android.text.TextUtils;
import android.webkit.URLUtil;
import androidx.activity.result.contract.ActivityResultContract;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PipedInputStream;
import java.io.PipedOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.UUID;
import java.util.concurrent.Executors;

public class DownloadJSOperationController extends ActivityResultContract<DownloadJSOperationController.Input, Boolean> {

    /* DownloadJSActivity Input */
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

    /* DownloadJSActivity internal operation */
    public static class Operation {

        private final Input input;
        public String operationID;
        public PipedOutputStream outStream;
        public PipedInputStream inStream;
        //state
        public Boolean closed;
        public Boolean started;
        public Boolean pendingClose;
        public Boolean failureClose;

        //
        public Operation(Input input) {
            this.input = input;
            this.operationID = input.operationID;
            this.closed = this.started = this.pendingClose = this.failureClose = false;
            this.outStream = new PipedOutputStream();
            try {
                this.inStream = new PipedInputStream(1024 * 64);
                this.inStream.connect(this.outStream);
            } catch (IOException e) {
                this.failureClose = true;
                this.pendingClose = true;
                Logger.debug("Exception while opening/connecting DownloadJSActivity streams.", e.toString());
            }
        }
    }

    /* DownloadJSActivity */
    private static final String EXTRA_OPERATION_ID = "OPERATION_ID";
    private final AppCompatActivity activity;
    private final HashMap<String, Operation> operations;
    private Operation pendingOperation;

    //
    public DownloadJSOperationController(AppCompatActivity activity) {
        this.activity = activity;
        this.operations = new HashMap<>();
    }

    /* Public operations */
    public boolean appendToOperation(String operationID, String data) {
        //get operation status
        Operation operation = this.operations.get(operationID);
        if (operation == null && this.pendingOperation.input.operationID.equals(operationID)) operation = this.pendingOperation;
        if (operation == null || operation.closed) return false; //already closed?
        //write
        try {
            operation.outStream.write(data.getBytes(StandardCharsets.ISO_8859_1));
        } catch (IOException e) {
            Logger.debug("Exception while writting on DownloadJSActivity stream. Closing it!", e.toString());
            //Ask for close
            operation.pendingClose = true;
        }
        return !operation.pendingClose;
    }

    public boolean failOperation(String operationID) {
        //get operation status
        Operation operation = this.operations.get(operationID);
        if (operation == null && this.pendingOperation.input.operationID.equals(operationID)) operation = this.pendingOperation;
        if (operation == null || operation.closed) return false; //already closed?
        //Ask for close
        operation.failureClose = true;
        operation.pendingClose = true;
        //
        return true;
    }

    public boolean completeOperation(String operationID) {
        //get operation status
        Operation operation = this.operations.get(operationID);
        if (operation == null && this.pendingOperation.input.operationID.equals(operationID)) operation = this.pendingOperation;
        if (operation == null || operation.closed) return false; //already closed?
        //Ask for close
        operation.pendingClose = true;
        //
        return true;
    }

    /* ActivityResultContract Implementation */
    @NonNull
    public Intent createIntent(@NonNull Context context, DownloadJSOperationController.Input input) {
        //ask path
        String[] paths =
            this.getUniqueDownloadFileNameFromDetails(input.fileNameURL, input.contentDisposition, input.optionalMimeType, null);
        //Create/config intent to prompt for file selection
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        if (paths != null && paths[1] != null) intent.putExtra(Intent.EXTRA_TITLE, paths[1]);
        intent.putExtra(EXTRA_OPERATION_ID, input.operationID);
        if (input.optionalMimeType != null) intent.setType(input.optionalMimeType);
        if (paths != null && paths[0] != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) intent.putExtra(
            DocumentsContract.EXTRA_INITIAL_URI,
            paths[0]
        );
        //Add operation
        this.pendingOperation = new Operation(input);
        //
        return intent;
    }

    public Boolean parseResult(int resultCode, @Nullable Intent result) {
        //get operation status
        Operation operation = this.pendingOperation;
        if (operation == null) return false; //double call?
        //Process if resultCode is OK and have result
        if (resultCode == Activity.RESULT_OK && result != null) {
            this.operations.put(operation.input.operationID, operation);
            this.pendingOperation = null;
            this.createThreadedPipeForOperation(operation, result.getData());
            return true;
        }
        //Cancel pre operation (haven't started yet)
        this.pendingOperation = null; //can't be used for writting anymore
        this.cancelPreOperation(operation);
        return false;
    }

    //Thread operation that uses duplex stream
    private void createThreadedPipeForOperation(Operation operation, Uri uri) {
        DownloadJSOperationController upperRef = this;
        Executors.newSingleThreadExecutor().execute(() -> upperRef.createPipeForOperation(operation, uri));
    }

    private void createPipeForOperation(Operation operation, Uri uri) {
        //check for operation finished
        if (operation.started || operation.closed) return;
        //start operation
        operation.started = true;
        //
        try {
            OutputStream output = this.activity.getContentResolver().openOutputStream(uri);
            int lastReadSize = 0;
            boolean flushed = false;
            while (!operation.pendingClose || lastReadSize > 0 || !flushed) {
                //Have what to read?
                lastReadSize = Math.min(operation.inStream.available(), 64 * 1024);
                if (lastReadSize <= 0) {
                    //read size is 0, attempt to flush duplex and make sure we got everything
                    if (!flushed) {
                        operation.outStream.flush();
                        flushed = true;
                    }
                    continue;
                }
                //Reset flushed state if we got more data
                flushed = false;
                //Read
                byte[] bytes = new byte[lastReadSize];
                lastReadSize = operation.inStream.read(bytes, 0, lastReadSize);
                output.write(bytes);
            }
            //Close streams
            output.flush(); //IO flush
            output.close();
            operation.closed = true;
            operation.outStream.close();
            operation.inStream.close();
            //Release from operations
            this.releaseOperation(operation.input.operationID);
            //Ask for media scan
            this.performMediaScan(uri);
        } catch (Exception e) {
            Logger.debug("Exception while running DownloadJSActivity threaded operation.", e.toString());
            //Cancel operation stream (safely) and release from operations
            this.cancelPreOperation(operation);
            this.releaseOperation(operation.input.operationID);
        }
        Logger.debug("DownloadJSActivity completed!", operation.input.operationID);
    }

    /* Operation Utils */
    private void cancelPreOperation(Operation operation) {
        operation.pendingClose = true;
        operation.closed = true;
        try {
            operation.outStream.close();
            operation.inStream.close();
        } catch (IOException ignored) {} //failsafe stream close
    }

    private void releaseOperation(String operationID) {
        //get operation status
        Operation operation = this.operations.get(operationID);
        if (operation == null && this.pendingOperation.input.operationID.equals(operationID)) operation = this.pendingOperation;
        if (operation == null) return; //already closed?
        //Check for pending closure (loop interruption)
        if (!operation.pendingClose) operation.pendingClose = true;
        //Remove from operations
        this.operations.remove(operation.input.operationID);
    }

    /* Media utils */
    private void performMediaScan(Uri uri) {
        // Tell the media scanner about the new file so that it is
        // immediately available to the user.
        MediaScannerConnection.scanFile(
            this.activity,
            new String[] { uri.toString() },
            null,
            (path, uri2) -> {
                //                    Logger.debug("ExternalStorage", "Scanned " + path + ":");
                //                    Logger.debug("ExternalStorage", "-> uri=" + uri2);
            }
        );
    }

    /* FS Utils */
    private String getDownloadFilePath(String fileName) {
        return Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS).getAbsolutePath() + '/' + fileName;
    }

    private boolean checkCreateDefaultDir() {
        boolean created = false;
        try {
            File dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            if (!dir.exists()) {
                if (dir.mkdir()) created = true;
            } else created = true;
        } catch (RuntimeException e) {
            Logger.debug("Error while creating default download dir:", e.toString());
        }
        return created;
    }

    private String[] getUniqueDownloadFileNameFromDetails(
        String fileDownloadURL,
        String optionalCD,
        String optionalMimeType,
        @Nullable Integer optionalSuffix
    ) {
        //Auxs for filename gen.
        String suggestedFilename = URLUtil.guessFileName(fileDownloadURL, optionalCD, optionalMimeType);
        ArrayList<String> fileComps = new ArrayList<>(Arrays.asList(suggestedFilename.split(".")));
        String suffix = (optionalSuffix != null ? " (" + optionalSuffix + ")" : "");
        //Check for invalid filename
        if (suggestedFilename.length() <= 0) suggestedFilename = UUID.randomUUID().toString();
        //Generate filename
        String fileName;
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
        //
        return new String[] { fullPath, fileName };
    }
}
