# Blind Wallet - The First Fully Accessible Web3 Wallet

## Vision
Our vision is to democratize access to the decentralized web (Web3) for the visually impaired community. We believe that financial sovereignty and the benefits of blockchain technology should be accessible to everyone, regardless of physical ability. By reimagining the wallet interface from the ground up—prioritizing audio, haptic, and gesture-based interactions over visual ones—we aim to bridge the digital divide in the crypto space.

**Long-term Vision:** While we are starting with a software solution to iterate quickly on interaction models, our ultimate goal is to build a **dedicated hardware wallet**. This physical device will offer superior security (cold storage) and a tactile interface designed specifically for blind users, featuring braille displays, dedicated tactile buttons, and biometric security, ensuring that managing digital assets is as safe and intuitive as possible.

## The Need
The current Web3 ecosystem is heavily reliant on visual interfaces. Wallet addresses are long hexadecimal strings, transaction confirmations require reading complex data, and seed phrases are text-based. This creates a massive barrier to entry for the 2.2 billion people globally with vision impairment.
- **Security Risks:** Screen readers can be cumbersome and may expose sensitive data if not optimized.
- **Dependency:** Many visually impaired users rely on sighted assistance for crypto transactions, compromising their financial independence.
- **Exclusion:** As the world moves towards digital finance, this demographic risks being left behind.

**Blind Wallet** addresses this by creating a "screen-optional" experience where every action can be performed confidently without sight.

## Features (Implemented)

### 🗣️ Voice Operation (`useVoice`)
- **Full Voice Control:** Navigate the entire wallet using natural language commands.
- **Commands:**
    - "Check Balance" -> Reads out current balance.
    - "Send [Amount] to [Name]" -> Initiates transaction.
    - "Read History" -> Audibly lists recent transactions.
    - "Where am I?" -> Reads current wallet address.
- **Feedback:** The system provides clear audio confirmation for every action, ensuring the user always knows the state of the application.

### 👆 Gesture & Click Patterns (`useGestures`)
- **Screen-Free Navigation:** Large, forgiving gesture areas replace small buttons.
- **Gestures:**
    - **Single Tap:** Confirm / Read current item.
    - **Double Tap:** Check History / Success confirmation.
    - **Triple Tap:** Emergency / Warning / Initiate Transfer.
    - **Long Press:** Context menu / Secondary actions.
- **Safety:** Gestures are designed to prevent accidental transfers.

### 📳 Haptic Feedback & Braille (`useHaptics`)
- **Tactile Confirmation:** Different vibration patterns for success, error, and warnings allow users to "feel" the transaction status.
- **Haptic Braille:** A novel feature that conveys information (like numbers or short codes) through rhythmic vibration patterns, allowing users to read private data silently without audio output.
- **Patterns:**
    - *Success:* Double short vibration.
    - *Error:* Long heavy vibration.
    - *Braille Numbers:* Rhythmic pulses corresponding to Braille dot patterns.

### ⌨️ Braille Keyboard Support
- **Input:** Fully compatible with external Braille keyboards and screen readers.
- **On-Screen Braille:** (Experimental) On-screen tap zones that map to Braille dots for private key entry.

## Security & Trade-offs
We acknowledge that a software-based wallet, especially one running in a browser environment, carries inherent risks compared to cold storage solutions. **This current iteration is "fragile" by design standards.** However, we believe this trade-off is necessary to:
1.  **Rapidly Prototyping Interactions:** We need to perfect the voice and gesture interface before committing to hardware.
2.  **Immediate Accessibility:** Waiting for hardware development would leave users excluded for years.

**Why it's worth it:**
This software phase allows us to build the *soul* of the product—the interaction model—while we engineer the *body* (the hardware). We are implementing rigorous software safeguards (like local encryption and potential MPC integration) to mitigate risks in the interim, ensuring that while the medium is temporary, the mission for financial independence is permanent.

## Roadmap

### Phase 1: Software Foundation (Current)
- [x] Core Voice & Gesture Interface
- [x] Haptic Feedback System
- [x] Basic Transaction & Wallet Management
- [x] Secure Voice-based Seed Phrase Creation

### Phase 2: Enhanced Security & Accessibility
- [ ] **Voice ID:** Biometric voice authentication for transaction signing.
- [ ] **MPC (Multi-Party Computation):** Sharding private keys to prevent single points of failure.
- [ ] **Social Recovery:** Allow trusted contacts to help recover lost access without exposing keys.

### Phase 3: Hardware Evolution (The Goal)
- **Dedicated Device:** A standalone hardware wallet.
- **Tactile Display:** Refreshable Braille line for verifying addresses and amounts.
- **Audio Jack / Bluetooth:** Secure audio output for privacy.
- **Fingerprint Scanner:** For rapid, secure authentication.
- **NFC:** Tap-to-pay functionality for real-world usage.

---
*Built with React + Vite + TailwindCSS*
