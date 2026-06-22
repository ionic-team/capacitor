//
//  CapacitorView.swift
//  Capacitor
//
//  Created by Joseph Orlando Pender on 6/22/26.
//  Copyright © 2026 Drifty Co. All rights reserved.
//
import SwiftUI

public struct CapacitorView: UIViewControllerRepresentable {
    public func makeUIViewController(context: Context) -> CAPBridgeViewController {
        CAPBridgeViewController()
    }
  
    public func updateUIViewController(_ vc: CAPBridgeViewController, context: Context) {}
}
