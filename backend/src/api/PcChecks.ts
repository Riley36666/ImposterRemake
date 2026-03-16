import express, { Request, Response } from "express";
import si from 'systeminformation';
const router = express.Router();

router.get("/", async (req:Request, res:Response) => {
    const info = await getPcInfo()
    res.json(info)
})


async function getPcInfo() {
  try {
    const cpu = await si.cpu();
    const cpuLoad = await si.currentLoad();
    const cpuTemp = await si.cpuTemperature();
    const mem = await si.mem();
    const disks = await si.diskLayout();
    const diskFs = await si.fsSize();
    const os = await si.osInfo();
    const time = await si.time();
    const network = await si.networkInterfaces();
    const networkStats = await si.networkStats();
    const graphics = await si.graphics();
    const battery = await si.battery();
    const info = {
      cpu: `${cpu.manufacturer} ${cpu.brand} @ ${cpu.speed}GHz (${cpu.cores} cores)`,

      cpuLoad: `Current Load: ${cpuLoad.currentLoad.toFixed(2)}%`,
      cpuTemperature: cpuTemp.main
        ? `${cpuTemp.main}°C`
        : "Temperature unavailable",
      memory: `Total: ${(mem.total / 1024 / 1024 / 1024).toFixed(2)} GB`,
      memoryUsage: `Used: ${(mem.used / 1024 / 1024 / 1024).toFixed(2)} GB (${((mem.used / mem.total) * 100).toFixed(2)}%)`,
      swap: `Used: ${(mem.swapused / 1024 / 1024 / 1024).toFixed(2)} GB / ${(mem.swaptotal / 1024 / 1024 / 1024).toFixed(2)} GB`,
      Storage: disks.map(
        d => `${d.name}: ${d.type} - ${(d.size / 1024 / 1024 / 1024).toFixed(2)} GB`
      ),
      diskUsage: diskFs.map(
        d => `${d.mount}: ${(d.used / 1024 / 1024 / 1024).toFixed(2)} GB / ${(d.size / 1024 / 1024 / 1024).toFixed(2)} GB`
      ),
      OS: `${os.distro} ${os.release} (${os.arch})`,
      kernel: os.kernel,
      uptime: `${(time.uptime / 3600).toFixed(2)} hours`,
      networkInterfaces: network.map(
        n => `${n.iface} - ${n.ip4 || "no IPv4"} (${n.type})`
      ),
      networkTraffic: networkStats.map(
        n => `${n.iface}: RX ${(n.rx_bytes / 1024 / 1024).toFixed(2)} MB / TX ${(n.tx_bytes / 1024 / 1024).toFixed(2)} MB`
      ),
      gpu: graphics.controllers.map(
        g => `${g.vendor} ${g.model} (${g.vram || "unknown"} MB VRAM)`
      ),
      battery: battery.hasBattery
        ? `${battery.percent}% ${battery.isCharging ? "(charging)" : "(discharging)"}`
        : "No battery detected"
    };

    return info;

  } catch (e) {
    console.log(e);
  }
}



export default router