# src/pages/Editor01.jsx

- loadImageFromFile · function · L15-L29 — function loadImageFromFile(file)
- calcSizeKeepRatio · function · L32-L37 — function calcSizeKeepRatio(w, h, maxEdge)
- resizeAndCompressToBlob · function · L40-L55 — async function resizeAndCompressToBlob(file, { maxEdge, quality })
- blobToFile · function · L58-L60 — function blobToFile(blob, fileName = 'image.jpg')
- twoStepCompress · function · L65-L85 — async function twoStepCompress(file, { preset1 = IMG_COMPRESS_PRESET_1, preset2 = IMG_COMPRESS_PRESET_2 } = {})
- resolveImageUrl · function · L87-L94 — resolveImageUrl = (raw)
- uploadRepresentativeImage · function · L97-L106 — async function uploadRepresentativeImage(file)
- putRepresentativeImages · function · L107-L120 — async function putRepresentativeImages(code, imagesMap = {})
- Editor01 · function · L123-L264 — function Editor01()
- handleImageChange · function · L148-L182 — handleImageChange = ()
