# src/pages/Editor07.jsx

- loadImageFromFile · function · L15-L29 — function loadImageFromFile(file)
- calcSizeKeepRatio · function · L32-L37 — function calcSizeKeepRatio(w, h, maxEdge)
- resizeAndCompressToBlob · function · L40-L55 — async function resizeAndCompressToBlob(file, { maxEdge, quality })
- blobToFile · function · L58-L60 — function blobToFile(blob, fileName = 'image.jpg')
- twoStepCompress · function · L65-L85 — async function twoStepCompress(file, { preset1 = IMG_COMPRESS_PRESET_1, preset2 = IMG_COMPRESS_PRESET_2 } = {})
- resolveImageUrl · function · L87-L94 — resolveImageUrl = (raw)
- uploadRepresentativeImage · function · L97-L106 — async function uploadRepresentativeImage(file)
- Editor07 · function · L108-L278 — function Editor07()
- putRepresentativeImages · function · L143-L156 — async function putRepresentativeImages(code, imagesMap = {})
- handleImageChange · function · L158-L192 — handleImageChange = ()
