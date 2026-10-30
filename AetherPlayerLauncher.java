import java.awt.*;
import java.io.File;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import javax.swing.*;

/**
 * AetherPlayerLauncher / Media File Validator
 * 
 * Provides native desktop window launching as well as robust file system
 * diagnostic checks for moved, deleted, or unreadable media files.
 */
public class AetherPlayerLauncher {
    private static final String APP_URL = "http://localhost:1420/";

    public static void main(String[] args) {
        // CLI File Diagnostics & Error Handling Mode
        if (args.length >= 2 && "--validate".equalsIgnoreCase(args[0])) {
            String filePath = args[1];
            validateMediaFile(filePath);
            return;
        }

        if (args.length >= 1 && "--help".equalsIgnoreCase(args[0])) {
            System.out.println("Miki Player Native Launcher & Media Diagnostic Engine");
            System.out.println("Usage:");
            System.out.println("  java AetherPlayerLauncher                Launch standalone borderless player");
            System.out.println("  java AetherPlayerLauncher --validate <path> Check if media exists and is playable");
            return;
        }

        // Standard App Launcher Mode
        SwingUtilities.invokeLater(() -> {
            ensureServerActive();
            launchStandaloneWindow();
        });
    }

    /**
     * Validates if a media file exists on disk, is readable, and provides actionable JSON recommendations.
     * Used by Miki Player smart error-handling to cleanly remove moved/deleted files from recents.
     */
    public static void validateMediaFile(String rawPath) {
        if (rawPath == null || rawPath.trim().isEmpty()) {
            System.out.println("{\"valid\":false,\"exists\":false,\"reason\":\"EMPTY_PATH\",\"action\":\"REMOVE_FROM_RECENT\"}");
            return;
        }

        // Clean file:// prefix if present
        String cleanPath = rawPath.startsWith("file://") ? rawPath.substring(7) : rawPath;
        File file = new File(cleanPath);

        if (!file.exists()) {
            System.out.printf("{\"valid\":false,\"exists\":false,\"path\":\"%s\",\"reason\":\"FILE_NOT_FOUND_OR_MOVED\",\"action\":\"REMOVE_FROM_RECENT\"}%n",
                cleanPath.replace("\\", "\\\\").replace("\"", "\\\""));
            return;
        }

        if (!file.canRead()) {
            System.out.printf("{\"valid\":false,\"exists\":true,\"readable\":false,\"path\":\"%s\",\"reason\":\"PERMISSION_DENIED\",\"action\":\"REQUEST_PERMISSIONS\"}%n",
                cleanPath.replace("\\", "\\\\").replace("\"", "\\\""));
            return;
        }

        long length = file.length();
        if (length == 0) {
            System.out.printf("{\"valid\":false,\"exists\":true,\"readable\":true,\"sizeBytes\":0,\"reason\":\"ZERO_BYTE_CORRUPTED\",\"action\":\"REMOVE_FROM_RECENT\"}%n");
            return;
        }

        String mimeType = "video/*";
        try {
            Path p = Paths.get(cleanPath);
            String detected = Files.probeContentType(p);
            if (detected != null) mimeType = detected;
        } catch (Exception ignored) {}

        System.out.printf("{\"valid\":true,\"exists\":true,\"readable\":true,\"sizeBytes\":%d,\"mimeType\":\"%s\",\"path\":\"%s\",\"action\":\"PLAY_MEDIA\"}%n",
            length, mimeType, cleanPath.replace("\\", "\\\\").replace("\"", "\\\""));
    }

    private static void ensureServerActive() {
        try {
            URL url = URI.create(APP_URL).toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(1000);
            conn.connect();
            if (conn.getResponseCode() == 200) {
                System.out.println("[Miki Player] Dev server is active at " + APP_URL);
            }
        } catch (IOException e) {
            System.out.println("[Miki Player] Starting Vite dev server...");
            try {
                new ProcessBuilder("npm", "run", "dev").start();
                Thread.sleep(2000);
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }
    }

    private static void launchStandaloneWindow() {
        try {
            File nativeApp = new File("./Miki Player.app/Contents/MacOS/Miki Player");
            File nativeBinary = new File("./MikiPlayer");

            if (nativeApp.exists() && nativeApp.canExecute()) {
                System.out.println("[Miki Player] Launching standalone Miki Player.app bundle...");
                new ProcessBuilder("open", "./Miki Player.app").start();
            } else if (nativeBinary.exists() && nativeBinary.canExecute()) {
                System.out.println("[Miki Player] Launching native borderless MikiPlayer binary...");
                new ProcessBuilder("./MikiPlayer").start();
            } else {
                System.out.println("[Miki Player] Launching run-desktop.sh...");
                new ProcessBuilder("./run-desktop.sh").start();
            }
            System.exit(0);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
