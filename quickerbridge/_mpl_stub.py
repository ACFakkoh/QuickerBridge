"""Tiny stand-in for matplotlib in the browser build.

PyCBA imports ``matplotlib.pyplot`` at module level for its plotting helpers,
which QuickerBridge never calls (the UI draws its own SVG diagrams). Loading
the real package in Pyodide costs ~11 MB of wheels (matplotlib, fonttools,
pillow, ...) and seconds of start-up. ``install()`` registers placeholder
modules only when matplotlib is not already importable; any attempt to plot
raises a clear error instead of failing silently.
"""

import importlib.abc
import importlib.machinery
import importlib.util
import sys
import types


class _Unavailable:
    def __init__(self, name):
        self._name = name

    def __getattr__(self, attr):
        return _Unavailable(f"{self._name}.{attr}")

    def __call__(self, *args, **kwargs):
        raise RuntimeError(
            f"{self._name}: plotting is not available in the QuickerBridge browser build"
        )


class _StubModule(types.ModuleType):
    def __getattr__(self, attr):
        if attr.startswith("__"):
            raise AttributeError(attr)
        return _Unavailable(f"{self.__name__}.{attr}")


class _Finder(importlib.abc.MetaPathFinder, importlib.abc.Loader):
    def find_spec(self, fullname, path=None, target=None):
        if fullname == "matplotlib" or fullname.startswith("matplotlib."):
            return importlib.machinery.ModuleSpec(fullname, self, is_package=True)
        return None

    def create_module(self, spec):
        module = _StubModule(spec.name)
        module.__path__ = []
        module.__quickerbridge_stub__ = True
        module.use = lambda *args, **kwargs: None  # backend selection is harmless
        return module

    def exec_module(self, module):
        pass


def install(force=False):
    """Register the stub; returns True when it is active."""
    if not force and importlib.util.find_spec("matplotlib") is not None:
        return False
    for name in [n for n in sys.modules if n.split(".")[0] == "matplotlib"]:
        del sys.modules[name]
    sys.meta_path.insert(0, _Finder())
    return True
