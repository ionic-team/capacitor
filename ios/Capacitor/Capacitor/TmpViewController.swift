import UIKit

class TmpViewController: UIViewController {
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        NotificationCenter.default.post(CAPBridge.tmpVCAppeared)
    }
}
