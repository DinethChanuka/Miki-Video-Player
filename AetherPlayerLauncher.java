import java.awt.*;
import java.io.File;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import javax.swing.*;

public class AetherPlayerLauncher {
    private static final String APP_URL = "http://localhost:1420/";

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            ensureServerActive();
            launchStandaloneWindow();
        });
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
            File nativeBinary = new File("./MikiPlayer");
            if (nativeBinary.exists() && nativeBinary.canExecute()) {
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
