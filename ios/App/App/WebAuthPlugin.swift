import Capacitor
import AuthenticationServices

@objc(WebAuthPlugin)
public class WebAuthPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WebAuthPlugin"
    public let jsName = "WebAuth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise)
    ]

    @objc func start(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"),
              let callbackScheme = call.getString("callbackScheme"),
              let url = URL(string: urlString) else {
            call.reject("Missing url or callbackScheme")
            return
        }

        DispatchQueue.main.async {
            let session = ASWebAuthenticationSession(url: url, callbackURLScheme: callbackScheme) { callbackURL, error in
                if let error = error {
                    call.reject(error.localizedDescription)
                    return
                }
                if let callbackURL = callbackURL {
                    call.resolve(["url": callbackURL.absoluteString])
                } else {
                    call.reject("No callback URL received")
                }
            }

            session.presentationContextProvider = self
            session.prefersEphemeralWebBrowserSession = false
            session.start()
        }
    }
}

extension WebAuthPlugin: ASWebAuthenticationPresentationContextProviding {
    public func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        return self.bridge?.webView?.window ?? ASPresentationAnchor()
    }
}
