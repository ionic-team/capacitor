package com.getcapacitor;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Environment;
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
import java.util.concurrent.ExecutorService;
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
    private final ExecutorService pipeExecutor = Executors.newCachedThreadPool();
    private Operation pendingOperation;

    public DownloadJSOperationController(AppCompatActivity activity) {
        this.activity = activity;
        this.operations = new HashMap<>();
    }

    /* Public operations */
    public boolean appendToOperation(String operationID, String data) {
        Operation operation = resolveOperation(operationID);
        if (operation == null || operation.closed) return false;
        try {
            operation.outStream.write(data.getBytes(StandardCharsets.ISO_8859_1));
        } catch (IOException e) {
            Logger.debug("Exception while writing on DownloadJSActivity stream. Closing it!", e.toString());
            operation.pendingClose = true;
        }
        return !operation.pendingClose;
    }

    public boolean failOperation(String operationID) {
        Operation operation = resolveOperation(operationID);
        if (operation == null || operation.closed) return false;
        operation.failureClose = true;
        operation.pendingClose = true;
        return true;
    }

    public boolean completeOperation(String operationID) {
        Operation operation = resolveOperation(operationID);
        if (operation == null || operation.closed) return false;
        operation.pendingClose = true;
        return true;
    }

    /* ActivityResultContract Implementation */
    @Override
    @NonNull
    public Intent createIntent(@NonNull Context context, DownloadJSOperationController.Input input) {
        String[] paths =
            this.getUniqueDownloadFileNameFromDetails(input.fileNameURL, input.contentDisposition, input.optionalMimeType, null);
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        if (paths != null && paths[1] != null) intent.putExtra(Intent.EXTRA_TITLE, paths[1]);
        intent.putExtra(EXTRA_OPERATION_ID, input.operationID);
        if (input.optionalMimeType != null) intent.setType(input.optionalMimeType);
        // EXTRA_INITIAL_URI expects a document/tree Uri. A filesystem path string is not valid
        // here and can crash on some OEMs, so we do not set it.
        this.pendingOperation = new Operation(input);
        return intent;
    }

    @Override
    public Boolean parseResult(int resultCode, @Nullable Intent result) {
        Operation operation = this.pendingOperation;
        if (operation == null) return false;
        if (resultCode == Activity.RESULT_OK && result != null) {
            Uri uri = result.getData();
            if (uri == null) {
                this.pendingOperation = null;
                this.cancelPreOperation(operation);
                return false;
            }
            this.operations.put(operation.input.operationID, operation);
            this.pendingOperation = null;
            this.createThreadedPipeForOperation(operation, uri);
            return true;
        }
        this.pendingOperation = null;
        this.cancelPreOperation(operation);
        return false;
    }

    private void createThreadedPipeForOperation(Operation operation, Uri uri) {
        pipeExecutor.execute(() -> createPipeForOperation(operation, uri));
    }

    private void createPipeForOperation(Operation operation, Uri uri) {
        if (operation.started || operation.closed) return;
        operation.started = true;
        try {
            OutputStream output = this.activity.getContentResolver().openOutputStream(uri);
            if (output == null) {
                Logger.debug("Failed to open OutputStream for uri in DownloadJSActivity threaded operation.", uri.toString());
                this.cancelPreOperation(operation);
                this.releaseOperation(operation.input.operationID);
                return;
            }
            byte[] buffer = new byte[64 * 1024];
            int lastReadSize;
            while (true) {
                lastReadSize = operation.inStream.read(buffer, 0, buffer.length);
                if (lastReadSize == -1) {
                    break;
                }
                if (lastReadSize == 0) {
                    if (operation.pendingClose) {
                        break;
                    }
                    continue;
                }
                output.write(buffer, 0, lastReadSize);
                if (operation.pendingClose && operation.inStream.available() <= 0) {
                    break;
                }
            }
            output.flush();
            output.close();
            operation.closed = true;
            operation.outStream.close();
            operation.inStream.close();
            this.releaseOperation(operation.input.operationID);
            this.performMediaScan(uri);
        } catch (Exception e) {
            Logger.debug("Exception while running DownloadJSActivity threaded operation.", e.toString());
            this.cancelPreOperation(operation);
            this.releaseOperation(operation.input.operationID);
        }
        Logger.debug("DownloadJSActivity completed!", operation.input.operationID);
    }

    /* Operation Utils */
    private Operation resolveOperation(String operationID) {
        Operation operation = this.operations.get(operationID);
        if (operation == null && this.pendingOperation != null && this.pendingOperation.input.operationID.equals(operationID)) {
            operation = this.pendingOperation;
        }
        return operation;
    }

    private void cancelPreOperation(Operation operation) {
        operation.pendingClose = true;
        operation.closed = true;
        try {
            operation.outStream.close();
            operation.inStream.close();
        } catch (IOException ignored) {}
    }

    private void releaseOperation(String operationID) {
        Operation operation = resolveOperation(operationID);
        if (operation == null) return;
        if (!operation.pendingClose) operation.pendingClose = true;
        this.operations.remove(operation.input.operationID);
        if (this.pendingOperation != null && this.pendingOperation.input.operationID.equals(operationID)) {
            this.pendingOperation = null;
        }
    }

    /* Media utils */
    private void performMediaScan(Uri uri) {
        MediaScannerConnection.scanFile(this.activity, new String[] { uri.toString() }, null, (path, uri2) -> {});
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
        String suggestedFilename = URLUtil.guessFileName(fileDownloadURL, optionalCD, optionalMimeType);
        ArrayList<String> fileComps = new ArrayList<>(Arrays.asList(suggestedFilename.split("\\.")));
        String suffix = (optionalSuffix != null ? " (" + optionalSuffix + ")" : "");
        if (suggestedFilename.length() <= 0) suggestedFilename = UUID.randomUUID().toString();
        String fileName;
        if (fileComps.size() > 1) {
            String fileExtension = "." + fileComps.remove(fileComps.size() - 1);
            fileName = TextUtils.join(".", fileComps) + suffix + fileExtension;
        } else {
            fileName = suggestedFilename + suffix;
        }
        if (!this.checkCreateDefaultDir()) return null;
        String fullPath = this.getDownloadFilePath(fileName);
        return new String[] { fullPath, fileName };
    }
}
