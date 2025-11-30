// popup.js - minimal UI (no build step) so you can load unpacked extension easily

async function getSelection(){
  return new Promise(resolve=>{
    chrome.tabs.query({active:true,currentWindow:true}, tabs=>{
      if(!tabs?.[0]?.id) return resolve(null);
      chrome.tabs.sendMessage(tabs[0].id, {type:'GET_SELECTION'}, (res)=>{
        if(chrome.runtime.lastError) return resolve(null);
        resolve(res);
      })
    })
  })
}

function renderRoot(selection){
  const root = document.getElementById('root');
  root.innerHTML = '';
  const title = document.createElement('h3');
  title.textContent = 'DAWA — Explain highlighted word';
  root.appendChild(title);

  if(!selection){
    const p = document.createElement('div');
    p.textContent = 'No selection detected. Highlight a word on the page and reopen the popup.';
    root.appendChild(p);
    return;
  }

  const wordDiv = document.createElement('div');
  wordDiv.innerHTML = `<strong>Word:</strong> ${selection.text}`;
  root.appendChild(wordDiv);

  const sent = document.createElement('div');
  sent.style.marginTop = '6px';
  sent.style.fontSize = '12px';
  sent.textContent = selection.sentence;
  root.appendChild(sent);

  const btn = document.createElement('button');
  btn.textContent = 'Analyze';
  btn.style.marginTop = '8px';
  btn.onclick = async ()=>{
    btn.disabled = true;
    btn.textContent = 'Analyzing...';
    try{
      const res = await fetch('http://localhost:8000/api/v1/analyze',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({text:selection.text, sentence:selection.sentence, language:'en'})
      });
      const json = await res.json();
      const out = document.createElement('pre');
      out.style.whiteSpace = 'pre-wrap';
      out.textContent = JSON.stringify(json, null, 2);
      root.appendChild(out);
    }catch(e){
      const err = document.createElement('div');
      err.style.color = 'red';
      err.textContent = 'Error: ' + (e.message || e);
      root.appendChild(err);
    }finally{
      btn.disabled = false;
      btn.textContent = 'Analyze';
    }
  };
  root.appendChild(btn);
}

getSelection().then(renderRoot);
