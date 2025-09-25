import argostranslate.package
import argostranslate.translate


def load_translation_models():
    argostranslate.package.update_package_index()
    packages = argostranslate.package.get_available_packages()

    desired_langs = ["en", "hi", "fr", "es", "de", "ja", "zh"]

    for package in packages:
        if package.from_code in desired_langs and package.to_code in desired_langs:
            downloaded_path = package.download()
            argostranslate.package.install_from_path(downloaded_path)
        


def translate_message(text: str, from_lang: str, to_lang: str) -> str:
    installed_languages = argostranslate.translate.get_installed_languages()
    from_lang_obj = next((lang for lang in installed_languages if lang.code == from_lang), None)
    to_lang_obj = next((lang for lang in installed_languages if lang.code == to_lang), None)

    if from_lang_obj and to_lang_obj:
        translation = from_lang_obj.get_translation(to_lang_obj)
        return translation.translate(text)
    return text