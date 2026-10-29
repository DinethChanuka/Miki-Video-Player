use crate::error::{PlayerError, PlayerResult};
use raw_window_handle::{HasWindowHandle, RawWindowHandle};
use tauri::WebviewWindow;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SurfacePlatform {
    MacOS,
    Windows,
    LinuxX11,
    LinuxWayland,
    Unknown,
}

#[derive(Debug, Clone)]
pub struct NativeSurfaceInfo {
    pub surface_id: i64,
    pub platform: SurfacePlatform,
}

pub struct WindowCompositor;

impl WindowCompositor {
    /// Extracts the platform-specific native surface ID (wid) suitable for passing to libmpv's `wid` option
    pub fn extract_surface_id(window: &WebviewWindow) -> PlayerResult<NativeSurfaceInfo> {
        let handle = window
            .window_handle()
            .map_err(|e| PlayerError::GpuSurfaceLost {
                platform: "any".into(),
                reason: format!("Failed to obtain window handle: {e}"),
            })?;

        match handle.as_raw() {
            RawWindowHandle::AppKit(handle) => {
                // macOS: NSView pointer as integer
                let ns_view_ptr = handle.ns_view.as_ptr() as i64;
                Ok(NativeSurfaceInfo {
                    surface_id: ns_view_ptr,
                    platform: SurfacePlatform::MacOS,
                })
            }
            RawWindowHandle::Win32(handle) => {
                // Windows: HWND as integer
                let hwnd_val = handle.hwnd.get() as i64;
                Ok(NativeSurfaceInfo {
                    surface_id: hwnd_val,
                    platform: SurfacePlatform::Windows,
                })
            }
            RawWindowHandle::Xlib(handle) => {
                // Linux X11: Window XID
                Ok(NativeSurfaceInfo {
                    surface_id: handle.window as i64,
                    platform: SurfacePlatform::LinuxX11,
                })
            }
            RawWindowHandle::Wayland(handle) => {
                // Linux Wayland: wl_surface pointer as integer
                let wl_ptr = handle.surface.as_ptr() as i64;
                Ok(NativeSurfaceInfo {
                    surface_id: wl_ptr,
                    platform: SurfacePlatform::LinuxWayland,
                })
            }
            _ => Err(PlayerError::GpuSurfaceLost {
                platform: "unsupported".into(),
                reason: "Window handle platform is not supported for native hardware surface binding".into(),
            }),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_surface_platform_equality() {
        assert_eq!(SurfacePlatform::MacOS, SurfacePlatform::MacOS);
        assert_ne!(SurfacePlatform::MacOS, SurfacePlatform::Windows);
    }
}
