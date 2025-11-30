function getSelectedContext(radius=80){
  const sel = window.getSelection();
  if(!sel || sel.rangeCount===0) return null;
  const text = sel.toString().trim();
  if(!text) return null;
  const full = document.body.innerText || '';
  const idx = full.indexOf(text);
  if(idx === -1){
    return {text, sentence: text};
  }
  const startIdx = Math.max(0, idx - radius);
  const endIdx = Math.min(full.length, idx + text.length + radius);
  const sentence = full.substring(startIdx,endIdx).replace(/\s+/g,' ');
  return {text, sentence};
}

chrome.runtime.onMessage.addListener((msg, sender, resp) =>{
  if(msg?.type === 'GET_SELECTION'){
    const ctx = getSelectedContext();
    resp(ctx);
  }
});
