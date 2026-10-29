import java.awt.*;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import javax.swing.*;

public class AetherPlayerLauncher {
    private static final String APP_URL = "http://localhost:1420/";

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            // Set undecorated window (removes native OS titlebar, close, minimize, maximize buttons)
            JFrame frame = new JFrame("AetherPlayer Undecorated");
            frame.setUndecorated(true);
            frame.setSize(1280, 720);
            frame.setLocationRelativeTo(null); // Center on screen
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

            // Verify server status and launch standalone player
            new Thread(() -> {
                ensureServerActive();
                launchStandaloneWindow();
            }).start();
        });
    }

    private static void ensureServerActive() {
        try {
            URL url = URI.create(APP_URL).toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(1000);
            conn.connect();
            if (conn.getResponseCode() == 200) {
                System.out.println("AetherPlayer dev server is active at " + APP_URL);
            }
        } catch (IOException e) {
            System.out.println("Starting Vite dev server from Java...");
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
            ProcessBuilder pb = new ProcessBuilder(
                "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
                "--app=" + APP_URL,
                "--window-size=1280,720",
                "--user-data-dir=/tmp/aether-java-profile"
            );
            pb.start();
            System.out.println("AetherPlayer launched successfully with Java launcher.");
            System.exit(0);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
