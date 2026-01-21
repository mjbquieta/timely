interface Record {
  enrollid: number;
  name: string;
  time: string;
  mode: number;
  inout: number;
  event: number;
}

interface DevInfo {
  modelname: string;
  manufacturer: string;
  usersize: number;
  facesize: number;
  fpsize: number;
  palmsize: number;
  cardsize: number;
  pwdsize: number;
  logsize: number;
  useduser: number;
  usedface: number;
  usedfp: number;
  usedpalm: number;
  usedcard: number;
  usedpwd: number;
  usedlog: number;
  usednewlog: number;
  usedrtlog: number;
  netinuse: number;
  usb4g: number;
  fpalgo: string;
  firmware: string;
  time: string;
  intercom: number;
  floors: number;
  acces_stimes: number;
  charid: number;
  useosdp: number;
  facetemplate: number;
  dislanguage: number;
  curip: string;
  ntp: number;
  timezone: string;
  mac: string;
}

interface RegisterDeviceMessage {
  cmd: string;
  sn: string;
  devinfo?: DevInfo;
}

interface UpSertUserMessage {
  cmd: string;
  sn: string;
  enrollid: number;
  name: string;
  backupnum: number;
  admin: number;
  record: string | number;
  fpflag: number;
  enable: number;
  shiftid: number;
  imagepath: string;
  signature: string;
}

interface TimeSyncMessage {
  cmd: string;
  sn: string;
  count: number;
  logindex: number;
  record: Record[];
}

export { RegisterDeviceMessage, TimeSyncMessage, UpSertUserMessage };
