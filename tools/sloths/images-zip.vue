async downloadZip(ids: string[]) {
      const urlToPromise = (url: string) => {
        return new Promise<Blob>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = () => {
            if (xhr.status === 200) {
              console.log('xhr.response: ', xhr.response);
              resolve(xhr.response);
            }
            reject(xhr.statusText);
          };

          xhr.open('GET', url);
          xhr.responseType = 'blob';
          xhr.send(null);
        });
      };

      const zip = JSZip();
      const zipFilename = `sloths_${new Date().toISOString()}.zip`;

      ids.forEach((id) => {
        zip.file(`${id}.svg`, urlToPromise(`${CDN_STICKERS_URL}/${id}/image.svg`));
      });

      zip
        .generateAsync({ type: 'blob' })
        .then((blob) => saveAs(blob, zipFilename))
        .catch((e) => errorHandler(e));
    }
