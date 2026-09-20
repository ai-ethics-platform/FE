# src/pages/Editor07_1.jsx

- loadImageFromFile · function · L16-L30 — function loadImageFromFile(file)
- calcSizeKeepRatio · function · L33-L38 — function calcSizeKeepRatio(w, h, maxEdge)
- resizeAndCompressToBlob · function · L41-L56 — async function resizeAndCompressToBlob(file, { maxEdge, quality })
- blobToFile · function · L59-L61 — function blobToFile(blob, fileName = 'image.jpg')
- twoStepCompress · function · L66-L86 — async function twoStepCompress(file, { preset1 = IMG_COMPRESS_PRESET_1, preset2 = IMG_COMPRESS_PRESET_2 } = {})
- resolveImageUrl · function · L88-L95 — resolveImageUrl = (raw)
- uploadImage · function · L98-L107 — async function uploadImage(file)
- Editor07 · function · L109-L301 — function Editor07()
- putRepresentativeImages · function · L143-L156 — async function putRepresentativeImages(code, imagesMap = {})
- uploadRepresentativeImage · function · L158-L167 — async function uploadRepresentativeImage(file)
- handleImageChange · function · L168-L202 — handleImageChange = ()
