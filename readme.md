
# projektron-bcs-assist

## usage

- **all Firefox Version**: install signed `.xpi`
- *ESR Firefox* Edition: install unsiged `.zip`
  - used for enterprise extensions
  - disable signing checks required: `xpinstall.signatures.required` = `false`  
- *Firefox Nightly* or *Firefox Developer* Edition: add Folder within Extension Page

## development

- `web-ext` npm package
  - for easy testing while developing
  - install package: `npm install --global web-ext`
  - check version: `web-ext --version`
  - run Firefox with extension code from directory: `web-ext run`
  - build extension (.zip) `web-ext build` (simple zipping with stripping non needed files)
- Firefox Extension debugging
  - `about:addons`
  - `about:debugging`:  
    temporäre Erweiterungen - Untersuchen / Neu laden

## ressources

- starting
  - [mozilla.org: Your first extension](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension)
  - [extensionworkshop.com: Getting started with web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext)
  - [github.com: webextensions example: borderify](https://github.com/mdn/webextensions-examples/tree/main/borderify)
- basics
  - [mozilla.org: Browser extensions: Implement a settings page](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Implement_a_settings_page)
- sign and deploy
  - [mozilla.org: addon signing](https://addons.mozilla.org)
  - [extensionworkshop.com: Package your extension](https://extensionworkshop.com/documentation/publish/package-your-extension/)
  - [extensionworkshop.com: Distribute Manifest V2 and V3 extensions](https://extensionworkshop.com/documentation/publish/distribute-manifest-versions/)
  - [extensionworkshop.com: Distributing an add-on yourself](https://extensionworkshop.com/documentation/publish/self-distribution/)
  - [extensionworkshop.com: Distribute pre-release versions](https://extensionworkshop.com/documentation/publish/distribute-pre-release-versions/)
  - [extensionworkshop.com: Submitting an add-on](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/)

## TODO

- Buchungsabschluss Hinweis Feiertage und Urlaubstage (im BCS) beachten
- Browser Permission (Domain) verbesserung möglich?
- Test: content_script nur laden bei Einstieg von anderer URL nicht bei refresh oder anderweitigem neuladen
  - ~~`if (window.history.length !== 1) return;`~~
  - ? [How do you detect changes in url with a chrome extension?](https://stackoverflow.com/questions/67727261/how-do-you-detect-changes-in-url-with-a-chrome-extension)
  - [How do I make it so my Chrome extension will only inject a script once?](https://stackoverflow.com/questions/18477232/how-do-i-make-it-so-my-chrome-extension-will-only-inject-a-script-once)
