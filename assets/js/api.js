
const DOKULAP_API_URL = localStorage.getItem('dokulap-api-url') || 'https://script.google.com/macros/s/AKfycbzF25et5u1Dyu67A0lFhkM53SDh4VU2_ghCToDKcvhe_2iqiqmYspkg_7eeBJ_FRMBIbw/exec';

const DokuAPI = {
  isConfigured(){ return !!DOKULAP_API_URL && !DOKULAP_API_URL.includes('PASTE_APPS_SCRIPT'); },
  async call(action,payload={}){
    if(!this.isConfigured()) throw new Error('URL Backend DokuLap belum dikonfigurasi.');
    const body=JSON.stringify({action,...payload});
    let res;
    try{
      res=await fetch(DOKULAP_API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body});
    }catch(err){ throw new Error('Gagal menghubungi backend untuk aksi '+action+': '+(err.message||err)); }
    let data;
    try{ data=await res.json(); }catch(err){ throw new Error('Respons backend untuk '+action+' tidak dapat dibaca. HTTP '+res.status); }
    if(!data.ok) throw new Error((data.error?data.error+': ':'')+(data.message||'API error'));
    return data;
  },
  token(){return localStorage.getItem('dokulap-token')||''},
  setSession(data){localStorage.setItem('dokulap-token',data.token);localStorage.setItem('dokulap-user',JSON.stringify(data.user||{}));},
  logout(){localStorage.removeItem('dokulap-token');localStorage.removeItem('dokulap-user');},
  async login(username,password){const data=await this.call('login',{username,password});this.setSession(data);return data},
  async bootstrap(){return this.call('bootstrap',{token:this.token()})},
  async activities(){return this.call('listActivities',{token:this.token()})},
  async documents(){return this.call('listDocuments',{token:this.token()})},
  async schools(){return this.call('listSchools',{token:this.token()})},
  async createActivity(activity){return this.call('createActivity',{token:this.token(),...activity})},
  async completeActivity(kegiatan_id){return this.call('completeActivity',{token:this.token(),kegiatan_id})},
  async createSchool(school){return this.call('createSchool',{token:this.token(),...school})},
  async updateSchool(school){return this.call('updateSchool',{token:this.token(),...school})},
  async deleteSchool(sekolah_id){return this.call('deleteSchool',{token:this.token(),sekolah_id})},
  async deleteDocument(dokumentasi_id){return this.call('deleteDocument',{token:this.token(),dokumentasi_id})},
  async uploadFile(file,kegiatan_id,keterangan='',onProgress=()=>{}){
    const base64=await fileToBase64(file,onProgress);
    return this.call('uploadFile',{token:this.token(),kegiatan_id,nama_file:file.name,mime_type:file.type||'application/octet-stream',base64,keterangan});
  }
};
function fileToBase64(file,onProgress){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onprogress=e=>{if(e.lengthComputable)onProgress(Math.round(e.loaded/e.total*45));};
    reader.onload=()=>{onProgress(50);resolve(String(reader.result).split(',')[1]||'')};
    reader.onerror=reject;reader.readAsDataURL(file);
  });
}
window.DokuAPI=DokuAPI;
