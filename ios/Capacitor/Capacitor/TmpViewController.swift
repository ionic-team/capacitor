import UIKit

internal class TmpViewController: UIViewController {
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        NotificationCenter.default.post(CapacitorBridge.tmpVCAppeared)
    }
}
