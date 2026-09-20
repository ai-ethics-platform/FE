# src/pages/Editor02.jsx

- loadImageFromFile · function · L15-L23 — function loadImageFromFile(file)
- calcSizeKeepRatio · function · L25-L30 — function calcSizeKeepRatio(w, h, maxEdge)
- resizeAndCompressToBlob · function · L32-L42 — async function resizeAndCompressToBlob(file, { maxEdge, quality })
- blobToFile · function · L44-L46 — function blobToFile(blob, fileName = 'image.jpg')
- twoStepCompress · function · L48-L63 — async function twoStepCompress(file, { preset1 = IMG_COMPRESS_PRESET_1, preset2 = IMG_COMPRESS_PRESET_2 } = {})
- resolveImageUrl · function · L66-L73 — resolveImageUrl = (raw)
- uploadRoleImage · function · L76-L113 — async function uploadRoleImage(slot, file)
- uploadDefaultForSlot · function · L116-L135 — async function uploadDefaultForSlot(slot, { onApplied } = {})
- Editor02 · function · L138-L342 — function Editor02()
- changeSlotImage · function · L210-L234 — changeSlotImage = (slot)
- putRoles · function · L236-L244 — putRoles = async ({ roles, background })
