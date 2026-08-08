import TapCheckInCore from '../components/TapCheckInCore.jsx'

// No login required — anyone with this link can check students in/out.
// Intended for a device that physically sits at the entrance (phone or
// laptop). See the admin-gated version (TapCheckIn.jsx) if you'd rather
// require a login first.
export default function PublicCheckIn() {
  return <TapCheckInCore />
}
