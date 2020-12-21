import UIKit

internal class TmpViewController: UIViewController {
    var count = 0
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        // On iOS 12 viewDidAppear is called when TmpViewController is created and
        // when the presented VC gets dismissed.
        // On iOS 13 only when the presented VC gets dismissed.
        // We only want to send the notification when the presented VC gets dismissed.
        if #available(iOS 13, *) {
            count += 2
        } else {
            count += 1
        }
        if count > 1 {
            NotificationCenter.default.post(CapacitorBridge.tmpVCAppeared)
        }
    }
}
