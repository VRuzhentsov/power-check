type STATUS_ONLINE = 'online';
type STATUS_OFFLINE = 'offline';
export interface DeviceMessage {
  deviceId: string;
  timestamp: string;
  status: STATUS_ONLINE | STATUS_OFFLINE;
}
