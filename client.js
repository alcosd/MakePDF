const input_url = document.querySelector('#input_url');
const btn_url = document.querySelector('#btn_url');
const form_pdf = document.querySelector('.form_pdf');

async function postData(data) {
    const body = new FormData();
    body.append('url', data.url);
    console.log(body.get('url'));
    /*
    req.bodyに
    {
        'url':'data'
    }
    req.body.url = data
    を追加
    */

    return fetch('/api/url/add', {
        method: 'POST',
        body: body
    });

    // fetch('/api/url/add', {
    //     method: 'POST',
    //     body: body
    // })
}

btn_url.addEventListener('click', () => {
    if(input_url != "") {
        let url = input_url.value;
        input_url.value = "";
        btn_url.style.display = "none";
        input_url.style.display = "none";

        // postData({url}).then((data) => console.log(data.id));
        postData({url})
        .then((response) => {
            if (!response.ok) {
                throw('画像取得エラー');
            }    
            return response.blob();
        })
        .then((blob) => {
            // console.log(blob.text());
            const url = URL.createObjectURL(blob);
            // const file = document.createElement('a');
            // document.body.appendChild(file);
            // file.download = 'output.pdf';
            // file.href = url;
            // file.click();

            const iframe = document.createElement('iframe');
            form_pdf.appendChild(iframe);
            iframe.id = "myIframe";
            iframe.width = "800";
            iframe.height = "600";
            iframe.src = url;
            URL.revokeObjectURL(url);
        })
        .catch((err) => {
            if(err) {
                console.log("err");
            }
        })
    }
});