export interface DeviceMessage extends UdpMessage {
  deviceId: string;
  deviceType: string;
}

export interface UdpMessage {
  timestamp: string;
}
