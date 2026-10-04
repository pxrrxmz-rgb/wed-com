const fs = require('fs');

let content = fs.readFileSync('products.js', 'utf-8');

// 1. Update the Modal HTML to include desc_th and full_th
const oldModalBlock = `<label style="display:block; margin-bottom:5px; color:#a4b0be;">Short Desc (EN)</label>
                          <input type="text" id="edit_desc_en" style="width:100%; padding:10px; margin-bottom:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px;">
                          
                          <label style="display:block; margin-bottom:5px; color:#a4b0be;">Full Details (EN)</label>
                          <textarea id="edit_full_en" rows="4" style="width:100%; padding:10px; margin-bottom:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px;"></textarea>`;

const newModalBlock = `<div style="display:flex; gap:15px;">
                              <div style="flex:1;">
                                  <label style="display:block; margin-bottom:5px; color:#a4b0be;">Short Desc (EN)</label>
                                  <input type="text" id="edit_desc_en" style="width:100%; padding:10px; margin-bottom:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px;">
                              </div>
                              <div style="flex:1;">
                                  <label style="display:block; margin-bottom:5px; color:#a4b0be;">Short Desc (TH)</label>
                                  <input type="text" id="edit_desc_th" style="width:100%; padding:10px; margin-bottom:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px;">
                              </div>
                          </div>
                          
                          <label style="display:block; margin-bottom:5px; color:#a4b0be;">Full Details (EN)</label>
                          <textarea id="edit_full_en" rows="3" style="width:100%; padding:10px; margin-bottom:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px;"></textarea>

                          <label style="display:block; margin-bottom:5px; color:#a4b0be;">Full Details (TH)</label>
                          <textarea id="edit_full_th" rows="3" style="width:100%; padding:10px; margin-bottom:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px;"></textarea>`;

content = content.replace(oldModalBlock, newModalBlock);

// 2. Update Modal get elements logic
const oldGetElements = `document.getElementById('edit_desc_en').value = prod.desc_en || '';
                      document.getElementById('edit_full_en').value = prod.full_en || '';`;

const newGetElements = `document.getElementById('edit_desc_en').value = prod.desc_en || '';
                      document.getElementById('edit_desc_th').value = prod.desc_th || '';
                      document.getElementById('edit_full_en').value = prod.full_en || '';
                      document.getElementById('edit_full_th').value = prod.full_th || '';`;

content = content.replace(oldGetElements, newGetElements);

// 3. Update Modal save elements logic
const oldSaveElements = `products[index].desc_en = document.getElementById('edit_desc_en').value;
                      products[index].full_en = document.getElementById('edit_full_en').value;`;

const newSaveElements = `products[index].desc_en = document.getElementById('edit_desc_en').value;
                      products[index].desc_th = document.getElementById('edit_desc_th').value;
                      products[index].full_en = document.getElementById('edit_full_en').value;
                      products[index].full_th = document.getElementById('edit_full_th').value;`;

content = content.replace(oldSaveElements, newSaveElements);

// 4. Replace hardcoded "Optimum x TECH GEAR" text block
const oldTextBlock = `<h2>Optimum x TECH GEAR</h2>
                <p>A minimalistic, primer-gray, legendless keycap set, made for the TECH GEAR 60HE+ (Module) but compatible with all 60% keyboards. Designed with Optimum.</p>
                <p>This keycap set was especially made for Ali from Optimum Tech. We wanted to make a set that perfectly aligns with the minimalistic style Ali is after. The keycaps in this set are completely blank and primer coloured, to add to the minimalistic style.</p>
                <p>How Optimum puts it: 'Minimal branding, neutral aesthetic, with a focus on premium materials, machining, and user experience'.</p>
                \${fullDesc ? '<div style="margin-top: 30px;"><h3 style="margin-bottom:10px;font-size:1.2rem;color:#fff;">More Details</h3><p>' + fullDesc + '</p></div>' : ''}`;

const newTextBlock = `\${fullDesc ? fullDesc.split('\\n').map(line => line.trim() ? \`<p style="margin-bottom: 15px; line-height: 1.6;">\${line}</p>\` : '').join('') : \`<p>\${desc}</p>\`}`;

content = content.replace(oldTextBlock, newTextBlock);

fs.writeFileSync('products.js', content, 'utf-8');
console.log('Successfully updated products.js to use dynamic full details text.');
