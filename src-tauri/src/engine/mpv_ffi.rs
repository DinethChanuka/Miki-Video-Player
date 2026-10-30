use crate::error::{PlayerError, PlayerResult};
use libloading::{Library, Symbol};
use std::ffi::{c_char, c_int, c_void};
use std::sync::Arc;

pub type MpvHandle = *mut c_void;

#[repr(C)]
#[derive(Debug, Copy, Clone)]
pub enum MpvFormat {
    None = 0,
    String = 1,
    OsdString = 2,
    Flag = 3,
    Int64 = 4,
    Double = 5,
    Node = 6,
    NodeArray = 7,
    NodeMap = 8,
    ByteArray = 9,
}

#[repr(C)]
#[derive(Debug, Copy, Clone)]
pub enum MpvEventId {
    None = 0,
    Shutdown = 1,
    LogMessage = 2,
    GetPropertyReply = 3,
    SetPropertyReply = 4,
    CommandReply = 5,
    StartFile = 6,
    EndFile = 7,
    FileLoaded = 8,
    ClientMessage = 16,
    VideoReconfig = 17,
    AudioReconfig = 18,
    Seek = 20,
    PlaybackRestart = 21,
    PropertyChange = 22,
}

#[repr(C)]
pub struct MpvEvent {
    pub event_id: MpvEventId,
    pub error: c_int,
    pub reply_userdata: u64,
    pub data: *mut c_void,
}

#[repr(C)]
pub struct MpvEventProperty {
    pub name: *const c_char,
    pub format: MpvFormat,
    pub data: *mut c_void,
}

pub struct MpvFunctions {
    pub create: Symbol<'static, unsafe extern "C" fn() -> MpvHandle>,
    pub initialize: Symbol<'static, unsafe extern "C" fn(ctx: MpvHandle) -> c_int>,
    pub destroy: Symbol<'static, unsafe extern "C" fn(ctx: MpvHandle)>,
    pub terminate_destroy: Symbol<'static, unsafe extern "C" fn(ctx: MpvHandle)>,
    pub command: Symbol<'static, unsafe extern "C" fn(ctx: MpvHandle, args: *mut *const c_char) -> c_int>,
    pub command_string: Symbol<'static, unsafe extern "C" fn(ctx: MpvHandle, args: *const c_char) -> c_int>,
    pub set_option_string: Symbol<
        'static,
        unsafe extern "C" fn(ctx: MpvHandle, name: *const c_char, data: *const c_char) -> c_int,
    >,
    pub set_property_string: Symbol<
        'static,
        unsafe extern "C" fn(ctx: MpvHandle, name: *const c_char, data: *const c_char) -> c_int,
    >,
    pub get_property_string:
        Symbol<'static, unsafe extern "C" fn(ctx: MpvHandle, name: *const c_char) -> *mut c_char>,
    pub free: Symbol<'static, unsafe extern "C" fn(data: *mut c_void)>,
    pub observe_property: Symbol<
        'static,
        unsafe extern "C" fn(
            ctx: MpvHandle,
            reply_userdata: u64,
            name: *const c_char,
            format: MpvFormat,
        ) -> c_int,
    >,
    pub wait_event: Symbol<'static, unsafe extern "C" fn(ctx: MpvHandle, timeout: f64) -> *mut MpvEvent>,
}

#[derive(Clone)]
pub struct MpvLib {
    inner: Arc<MpvLibInner>,
}

struct MpvLibInner {
    _lib: Library,
    fns: MpvFunctions,
}

impl MpvLib {
    pub fn load() -> PlayerResult<Self> {
        let candidates = if cfg!(target_os = "macos") {
            vec![
                "libmpv.2.dylib",
                "libmpv.dylib",
                "/opt/homebrew/lib/libmpv.dylib",
                "/usr/local/lib/libmpv.dylib",
                "@rpath/libmpv.2.dylib",
            ]
        } else if cfg!(target_os = "windows") {
            vec!["mpv-2.dll", "mpv-1.dll", "libmpv-2.dll"]
        } else {
            vec![
                "libmpv.so.2",
                "libmpv.so.1",
                "libmpv.so",
                "/usr/lib/libmpv.so.2",
                "/usr/local/lib/libmpv.so.2",
            ]
        };

        let mut last_err = String::new();
        for path in candidates {
            match unsafe { Library::new(path) } {
                Ok(lib) => {
                    // Leak library to obtain 'static symbols safe for long-lived app lifetime
                    let static_lib: &'static Library = Box::leak(Box::new(lib));
                    unsafe {
                        let create = match static_lib.get(b"mpv_create") {
                            Ok(s) => s,
                            Err(e) => {
                                last_err = e.to_string();
                                continue;
                            }
                        };
                        let initialize = static_lib.get(b"mpv_initialize").map_err(|e| {
                            PlayerError::MpvInitFailed(format!("mpv_initialize symbol missing: {e}"))
                        })?;
                        let destroy = static_lib.get(b"mpv_destroy").map_err(|e| {
                            PlayerError::MpvInitFailed(format!("mpv_destroy symbol missing: {e}"))
                        })?;
                        let terminate_destroy = static_lib.get(b"mpv_terminate_destroy").map_err(|e| {
                            PlayerError::MpvInitFailed(format!("mpv_terminate_destroy symbol missing: {e}"))
                        })?;
                        let command = static_lib.get(b"mpv_command").map_err(|e| {
                            PlayerError::MpvInitFailed(format!("mpv_command symbol missing: {e}"))
                        })?;
                        let command_string = static_lib.get(b"mpv_command_string").map_err(|e| {
                            PlayerError::MpvInitFailed(format!("mpv_command_string symbol missing: {e}"))
                        })?;
                        let set_option_string = static_lib.get(b"mpv_set_option_string").map_err(|e| {
                            PlayerError::MpvInitFailed(format!("mpv_set_option_string symbol missing: {e}"))
                        })?;
                        let set_property_string = static_lib.get(b"mpv_set_property_string").map_err(|e| {
                            PlayerError::MpvInitFailed(format!("mpv_set_property_string symbol missing: {e}"))
                        })?;
                        let get_property_string = static_lib.get(b"mpv_get_property_string").map_err(|e| {
                            PlayerError::MpvInitFailed(format!("mpv_get_property_string symbol missing: {e}"))
                        })?;
                        let free = static_lib.get(b"mpv_free").map_err(|e| {
                            PlayerError::MpvInitFailed(format!("mpv_free symbol missing: {e}"))
                        })?;
                        let observe_property = static_lib.get(b"mpv_observe_property").map_err(|e| {
                            PlayerError::MpvInitFailed(format!("mpv_observe_property symbol missing: {e}"))
                        })?;
                        let wait_event = static_lib.get(b"mpv_wait_event").map_err(|e| {
                            PlayerError::MpvInitFailed(format!("mpv_wait_event symbol missing: {e}"))
                        })?;

                        let fns = MpvFunctions {
                            create,
                            initialize,
                            destroy,
                            terminate_destroy,
                            command,
                            command_string,
                            set_option_string,
                            set_property_string,
                            get_property_string,
                            free,
                            observe_property,
                            wait_event,
                        };

                        log::info!("Successfully loaded libmpv from path: {path}");
                        return Ok(Self {
                            inner: Arc::new(MpvLibInner {
                                _lib: Library::new(path).unwrap(),
                                fns,
                            }),
                        });
                    }
                }
                Err(err) => {
                    last_err = err.to_string();
                }
            }
        }

        Err(PlayerError::MpvLibraryMissing(format!(
            "Could not locate libmpv dynamic library. Search failed with: {last_err}"
        )))
    }

    pub fn fns(&self) -> &MpvFunctions {
        &self.inner.fns
    }
}
