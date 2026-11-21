const status = process.argv[2];

switch (status) {
  case "0":
    console.log("Launch truth: live state matches register.");
    break;
  case "1":
    console.error("::error::Launch truth DRIFT or assertion failure (exit 1). Inspect the checker output.");
    break;
  case "2":
    console.warn("::warning::Launch truth UNVERIFIED (transport failure, exit 2). Check network access or retry.");
    break;
  case "3":
    console.error("::error::Launch truth STALE (exit 3). Refresh the register against current evidence.");
    break;
  default:
    console.error(`::error::Launch truth checker returned unexpected status ${status ?? "(missing)"}.`);
}
process.exitCode = /^(0|[1-9][0-9]{0,2})$/.test(status) && Number(status) <= 255
  ? Number(status)
  : 1;
