"""
Config file used for build.py
"""

CONFIG = {

    # ==========================================================================
    # = Custom Theme =
    # ==========================================================================

    # See (TODO link documentation here) for more info
    "theme-folder": None,
    #"theme-folder": "132",
    #"theme-folder": "opt_vocab",
    #"theme-folder": "rayrtheii",

    # whether the theme options overrides the user options or not
    "theme-override-user-options": True,




    # ==========================================================================
    # = Other =
    # ==========================================================================

    # - File searched under (root)/config.
    # - Ignores if it doesn't exist.
    # - Must be valid json5! If you want it to be empty,
    #   at least make sure the file contains {}
    "runtime-options-path": "runtime_opts.json5",
    "compile-options-path": "compile_opts.json5",

    # - File searched under (root).
    # - Ignores folder if it doesn't exist.
    "templates-override-folder": "overrides",

    # - File searched under (root).
    "translation-file": "src/data/translations.jsonc",

    # - You need dart-sass!
    "sass-path": "sass",
}
