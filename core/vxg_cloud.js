/* ATTENTION: Do not edit this file for no good reason!!!. This is a kernel file, and the performance of the entire system depends on its contents. */

window.vxg = window.vxg || {};
vxg.support = vxg.support || {};
vxg.cameras = vxg.cameras || {};
vxg.cameras.objects = vxg.cameras.objects || {};
vxg.cameras.update_delay = vxg.cameras.update_delay || 60;     // minimum delay time before update data, in seconts
vxg.cameras.preload_size = vxg.cameras.preload_size || 10;
vxg.cameras.one_time_load_limit = vxg.cameras.one_time_load_limit || 1000; // maximum items that can be downloaded at a time
vxg.cameras.random_list = vxg.cameras.random_list || {};         // random list of camera structures
vxg.cameras.continuous_list = vxg.cameras.continuous_list || [];      // continuous list of camera structures


////////////////////////////////////////////
// Helper functions

vxg.support.dateToUserTimeString = function(date){
    if (date===undefined) date = new Date();
    return date.toLocaleString('en-CA', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false }).replace(/[,|.]/g,'').replace(' 24',' 00');
}
vxg.support.dateToUserTimeStringWithMilliseconds = function(date){
    if (date===undefined) date = new Date();
    return ''+date.getHours()+':'+(date.getMinutes()>9?'':'0')+date.getMinutes()+':'+(date.getSeconds()>9?'':'0')+date.getSeconds()+'.'+Math.floor(date.getMilliseconds()/100);
}

vxg.support.aiTypeToAIName = function(ai_type){
    switch(ai_type){
        // AWS
        case 'object_and_scene_detection': return 'OBJECT AND SCENE DETECTION';
        case 'facial_analysis': return 'FACIAL ANALYSIS';
        // MS
        case 'computer_vision': return 'COMPUTER VISION'; 
        case 'face': return 'FACE DETECTION';
        // GOOGLE
        case 'detect_labels': return 'DETECT LABELS'; 
        case 'detect_faces': return 'DETECT FACES';
        case 'object_localization' : return 'OBJECT LOCALIZATION'; 
        default:
    }
    return '';
}

vxg.support.md5 = function(d){return rstr2hex(binl2rstr(binl_md5(rstr2binl(d),8*d.length)))}
function rstr2hex(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}
function rstr2binl(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}
function binl2rstr(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}
function binl_md5(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}
function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}
function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}
function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}
function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}
function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}
function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}
function bit_rol(d,_){return d<<_|d>>>32-_}


////////////////////////////////////////////
// Camera object functions

vxg.cameras.objects.CameraEvent = function(src){
    let self = this;
    if (src!==undefined) self.src = src;

    this.getFileMeta = function(){
        if (!this.src.filemeta || !this.src.filemeta.download || !this.src.filemeta.download.url) return defaultPromise();
        return $.ajax({
          type: "GET",
          url: this.src.filemeta.download.url,
          cache: true,
          dataType: 'json'
        });
    }
};

vxg.cameras.objects.CameraEventList = function(token){
    let self = this;
    this.token = token;
    this.random_list = [];

    this.getList = function(limit, offset, starttime, endtime, type, meta){
        return vxg.api.cloud.getEventslist(this.token, limit, offset, meta ? {'include_filemeta_download':true,'include_meta':true,'order_by':'-time', 'meta':meta} : undefined, type, starttime, endtime).then(function(r){
            self.total_count = r.meta.total_count;
            let ret = [];
            for (let i=0;i<r.objects.length; i++){
                self.random_list[r.objects[i]['id']] = ret[i] = new vxg.cameras.objects.CameraEvent(r.objects[i]);
            }
            return ret;
        });
    }
    this.getEventByID = function(event_id){
        let ev = event_id;
        let self = this;

        return vxg.api.cloud.getEventByID(event_id, this.token).then(function(r){
            return new vxg.cameras.objects.CameraEvent(r);
        });
    }
}

CloudCamera = window.CloudCamera || {}

let old_camera_prototype = vxg.cameras.objects.Camera ? vxg.cameras.objects.Camera.prototype : undefined;

vxg.cameras.objects.Camera = function(token_or_id) {
    if (parseInt(token_or_id)>0)
        this.camera_id = parseInt(token_or_id);

    if(typeof token_or_id === "string" && !parseInt(token_or_id)) {
        try{
            let t = JSON.parse(atob(token_or_id));
            this.camera_id = t.camid;
            this.token = token_or_id;
            this.events = new vxg.cameras.objects.CameraEventList(token_or_id);
        } catch(e){
        }
    } 
}

if (old_camera_prototype) {
    vxg.cameras.objects.Camera.prototype = old_camera_prototype;
    vxg.cameras.objects.Camera.prototype.__proto__ = CloudCamera;
} else
    vxg.cameras.objects.Camera.prototype = CloudCamera;

CloudCamera.getCameraID = CloudCamera.getChannelID = function(){
    return this.camera_id;
}

CloudCamera.getToken = function(){
    let self=this;
    if (this.token)
        return new Promise(function(resolve, reject){setTimeout(function(){resolve(self.token);}, 0);});
    if (this.src && this.src.token)
        return new Promise(function(resolve, reject){setTimeout(function(){resolve(self.src.token);}, 0);});
// TODO: get token by channel id and shared token or license key
    return new Promise(function(resolve, reject){setTimeout(function(){reject();}, 0);});
}

CloudCamera.getSrc = function(){
    let self = this;
    return vxg.api.cloud.getCameraInfo(this.camera_id, this.token).then(function(src){
        self.src = src;
        if (src.token) self.token = src.token;
        return src;
    });
}

CloudCamera.getName = function(){
    let self=this;
    if (this.src && this.src.name)
        return new Promise(function(resolve, reject){setTimeout(function(){resolve(self.src.name);}, 0);});
    if (this.bsrc && this.bsrc.name)
        return new Promise(function(resolve, reject){setTimeout(function(){resolve(self.bsrc.name);}, 0);});
    return this.getSrc().then(function(src){
        return src.name;
    });
}

CloudCamera.getPreview = function(){
    let self = this;
    if (this.preview && (new Date(this.preview.expire+'Z') > new Date())){
        let url = this.preview['url'];
        return new Promise(function(resolve, reject){setTimeout(function(){resolve(url);}, 0);});
    }
    return this.getToken().then(function(token){
        return vxg.api.cloud.getPreview(token).then(function(r){
            if (r.url) {
                self.preview = r;
                return r.url;
            }
            return '';
        });
    }).catch(function(){
        return '';
    });;
}

CloudCamera.getLocation = function(){
    let meta = this.src && this.src.meta && typeof this.src.meta === 'object' ? this.src.meta : {};
    for (let i in meta)
        if (i.substr(0,2)==='L+')
            return meta[i];
    return '';
}

CloudCamera.getConfig = function(){
    let self = this;
    return vxg.api.cloud.getCameraConfig(this.camera_id, this.token).then(function(bsrc){
        self.src.meta = bsrc.meta;
        self.bsrc = {
            address: null,
            channelID: bsrc['id'],
            created: bsrc['created'],
            isRecording: bsrc['rec_status']=='on',
            lat: bsrc['latitude'] ? bsrc['latitude'] : 0,
            lon: bsrc['longitude'] ? bsrc['longitude'] : 0,
            name: bsrc['name'],
            onvifRtspPort: bsrc['onvif_rtsp_port_fwd'] ? bsrc['onvif_rtsp_port_fwd'] : 0,
            roToken: this.token,
            rwToken: this.token,
            tz: bsrc['timezone'],
            username: bsrc['login'],
            password: bsrc['password'],
            url: bsrc['url']
        };
        return self.bsrc;
    });
}

CloudCamera.updateCameraPromise = function(camera_struct){
    if (camera_struct===this.camera){
        console.error('Do not use the same object - use only copy. Sample: camera = JSON.parse(JSON.stringify(camera))');
        return;
    }
    let config = {
        name: camera_struct['name'],
        latitude: camera_struct['lat'],
        longitude: camera_struct['lon'],
        timezone: camera_struct['timezone'] ? camera_struct['timezone'] : camera_struct['tz']
    };
    if (parseInt(camera_struct['onvif_rtsp_port_fwd'])>0) config.onvif_rtsp_port_fwd = parseInt(camera_struct['onvif_rtsp_port_fwd']);
    if (camera_struct['username'].trim()) {
        config.login = camera_struct['username'].trim();
        config.password = camera_struct['password'] ? camera_struct['password'].trim() : '';
    }
    if (camera_struct['url'].trim()) 
        config.url = camera_struct['url'].trim();
    return vxg.api.cloud.updateCameraConfig(this.camera_id, this.token, config).then(function(){
        window.vxg.cameras.invalidate();
    });
};


CloudCamera.resolverService = function(serialnumber, password){
    return vxg.api.cloud.resolverService(serialnumber, password,'');
}

CloudCamera.getMotionDetectionInfo = function(){
    return this.getToken().then(function(token){
        return vxg.api.cloud.getCameraMotionDetection(token);
    });
}

CloudCamera.getMotionDetectionRegions = function(){
    return this.getToken().then(function(token){
        return vxg.api.cloud.getCameraMotionDetectionRegions(token);
    });
}

CloudCamera.setMotionDetectionRegions = function(regions){
    let reg = regions;
    return this.getToken().then(function(token){
        return vxg.api.cloud.setCameraMotionDetectionRegions(reg, token);
    });
}

CloudCamera.getCameraSettings = function(data){
    let d = data; let self = this;
    return this.getToken().then(function(token){
        return vxg.api.cloud.setCameraSettings(self.camera_id, token, d);
    });
},
CloudCamera.setCameraSettings = function(data){
    let d = data; let self = this;
    return this.getToken().then(function(token){
        return vxg.api.cloud.setCameraSettings(self.camera_id, token, d);
    });
}

CloudCamera.saveUserMeta = function(data){
    return this.getToken().then(function(token){
        return vxg.api.cloud.saveUserMeta(token, data);
    });
}
CloudCamera.deleteUserMeta = function(metaid){
    return this.getToken().then(function(token){
        return vxg.api.cloud.deleteUserMeta(token, metaid);
    });
}
CloudCamera.getUserMetaBeforeTime = function(timestamp){
//    let data = {"limit": 30,"offset": 0,"sort": ["-timestamp"],"filter":{"and":[{"field":"long.usermeta","eq":1}]}};
    let data = {"limit": 300,"sort": ["-timestamp"],"filter":{"and":[{"field":"string.type","words_in":"note"}]}};
    return this.getToken().then(function(token){
        return vxg.api.cloud.getUserMeta(token, data);
    });
}

class CloudClip{
    constructor(data, token) {
        this.src = data;
        this.token = token;
    }
    getClipReady(){
        let self=this;
        let d = $.Deferred();
        if (this.src.status=="done")
            setTimeout(function(){d.resolve(self);},0);
        else if (this.src.status=="pending")
            setTimeout(function(){
                vxg.api.cloud.getClip(self.token,self.src.id).then(function(data){
                    self.src = data;
                    self.getClipReady().then(function(newclip){
                        d.resolve(newclip);
                    },function(){
                        d.reject();
                    });
                });
            },1000);
        else 
            setTimeout(function(){d.reject();},0);
        return d;
    }
    setMeta(clipname, notes, clipcase, incidenttime){
        let da = window.skin!==undefined && window.skin.disable_clip_archive;
        if (da) return new Promise(function(resolve, reject){setTimeout(function(){resolve();}, 0);});
        return vxg.api.cloud.createClipMeta(this.token, this.src.id, notes, new Date().toISOString().replace('Z',''), clipname, clipcase, incidenttime);
    }
}

CloudCamera.createClip = function(utc_start_ms, utc_end_ms, title, utc_delete_at_ms, storage_cam_id){
    let self = this;
    let start = (new Date(utc_start_ms)).toISOString().substr(0,19);
    let end = (new Date(utc_end_ms)).toISOString().substr(0,19);
    let delete_at = utc_delete_at_ms!==undefined ? (new Date(utc_delete_at_ms)).toISOString().substr(0,19) : (new Date(utc_end_ms+1000*100*365*24*60*60)).toISOString().substr(0,19);

    let d;
    if (!storage_cam_id && vxg.user && vxg.user.src && vxg.user.src.allCamsTokenMeta && vxg.user.src.allCamsTokenMeta.storage_channel_id)
        storage_cam_id = parseInt(vxg.user.src.allCamsTokenMeta.storage_channel_id);

    let da = window.skin!==undefined && window.skin.disable_clip_archive;
    if (storage_cam_id){
        d = $.Deferred();
        setTimeout(function(){d.resolve(storage_cam_id);},0);
    } else if (da || !storage_cam_id && typeof this.getStorageCamera !== "function"){
        d = $.Deferred();
        setTimeout(function(){d.resolve(self.camera_id);},0);
    } else
        d = this.getStorageCamera();

    return d.then(function(storage_cam_id){
        return self.getToken().then(function(token){
            let tok = vxg.user.src.allCamsToken;
            if (da && self.token) tok = self.token;
            return vxg.api.cloud.createClip( da ? undefined : self.camera_id, da ? self.camera_id :storage_cam_id, start, end, title, delete_at, tok).then(function(data){
                if (da) return new CloudClip(data, token);
                return vxg.cameras.getCameraByIDPromise(parseInt(vxg.user.src.allCamsTokenMeta.storage_channel_id),vxg.user.src.allCamsToken).then(function(r){
                    return new CloudClip(data, r.token);
                })
            });
        });
    });
}

vxg.cameras.getCameraFilterListPromise = function(limit, offset, filterarray, namefilter, all_filters){
    let self = this;
    if (!all_filters){
        return vxg.cameras.getLocations(50,0).then(function(locations){
            return vxg.cameras.getCameraFilterListPromise(limit, offset, filterarray, namefilter, locations);
        });
    }

    let metafilter=''; let metanotfilter='isstorage';

    if (filterarray){
        let have_nolocation=false;
        for (let i=0;i<filterarray.length;i++)
            if (filterarray[i]=='')
                have_nolocation = true;
        if (!have_nolocation) for (let i=0;i<filterarray.length;i++){
            if (filterarray[i]=='') continue;
                metafilter += (metafilter?',':'')+'L+'+filterarray[i];
        } else if (all_filters) for (let i in all_filters){
            if (all_filters[i]==='') continue;
            let isexist=false;
            for (let j=0;j<filterarray.length;j++){
                if (filterarray[j]==='') continue;
                if (filterarray[j]===all_filters[i])
                    isexist=true;
            }
            if (isexist) continue;
            metanotfilter += (metanotfilter?',':'')+'L+'+all_filters[i];
        }
    }

    let req = {limit:limit, offset:offset};
    if (metafilter) req.meta = metafilter;
    if (metanotfilter) req.meta_not = metanotfilter;
    if (namefilter) req.name__icontains = namefilter;
    return vxg.api.cloud.getCamerasList(req).then(function(r){
        let ret=[];
        for (let i=0;i<r['objects'].length;i++){
            ret[i] = new vxg.cameras.objects.Camera(r.objects[i].token ? r.objects[i].token : r.objects[i].id);
            ret[i].src = r.objects[i];
        }
        return ret;
    });

//    return vxg.cameras.getCameraListPromise(limit, offset, metafilter,metanotfilter, namefilter);
/*

    let include_not = false;
    for (let i=0;i<filterarray.length;i++){
        if (filterarray[i]==''){
            include_not = true;
            continue;
        }
        metafilter += (metafilter?',':'')+'L+'+filterarray[i];
    }
    if (!metafilter) metafilter='++++++++';
    return vxg.cameras.getCameraListPromise(limit, offset, metafilter,undefined, namefilter).then(function(res){
        if (!include_not) return res;
        return vxg.cameras.getCameraListPromise(limit, offset, undefined, vxg.cameras.getLocations.metanotfilter).then(function(r){
            for (i=0;i<r.length;i++) res.push(r[i]);
            return res;
        });
    });
*/
}

vxg.cameras.getCameraListWithLatLonPromise = function(limit, offset){
    return vxg.cameras.getCameraListPromise(limit, offset).then(function(r){
        return vxg.api.cloud.getCamerasListV2(vxg.user.src.allCamsToken,limit, offset, {'longitude__isnull':false,'latitude__isnull':false}).then(function(rc){
            let ret = [];
            for (let i=0;i<rc.objects.length;i++){
                for (let j=0;i<r.length;j++){
                    if (r[j].camera_id==rc.objects[i].id){
                        r[j].src2 = rc.objects[i];
                        ret.push(r[j]);
                        break;
                    }
                }
            }
            return ret;
        });
    });
}

vxg.cameras.getCameraListPromise = function(limit, offset, metafilter, metanotfilter, namefilter){
    if (isNaN(parseInt(limit)) || isNaN(parseInt(offset))){
        console.error('Offset can be only number');
        return;
    }
    if (vxg.cameras.getCameraListPromise._last_metafilter!=metafilter || vxg.cameras.getCameraListPromise._last_metanotfilter!=metanotfilter || vxg.cameras.getCameraListPromise._last_namefilter!=namefilter)
        vxg.cameras.invalidate();
    if (metafilter)
        vxg.cameras.getCameraListPromise._last_metafilter=metafilter;
    else
        delete vxg.cameras.getCameraListPromise._last_metafilter;
    if (metanotfilter)
        vxg.cameras.getCameraListPromise._last_metanotfilter=metanotfilter;
    else
        delete vxg.cameras.getCameraListPromise._last_metanotfilter;
    if (namefilter)
        vxg.cameras.getCameraListPromise._last_namefilter=namefilter;
    else
        delete vxg.cameras.getCameraListPromise._last_namefilter;

    vxg.cameras.getCameraListPromise._last_update_utc = vxg.cameras.getCameraListPromise._last_update_utc || 0;

    function getExist(limit,offset){
        // if list need to update
        if (vxg.cameras.getCameraListPromise._last_update_utc + vxg.cameras.update_delay*1000 < Date.now()) return false;
        if (!vxg.cameras.total_cameras) return false;
        let ret = [];
        let to = offset+limit > vxg.cameras.total_cameras ? vxg.cameras.total_cameras : offset+limit;
        for (let i=offset; i<to; i++){
            if (vxg.cameras.continuous_list[i]===undefined)
                return false;
            ret[i] = vxg.cameras.continuous_list[i];
        }
        let r = new Promise(function(resolve, reject){this.timer_id = setTimeout(function(){resolve(ret);}, 0);});
        r.cancel = function(){if (this.timer_id) clearTimeout(this.timer_id);};
        return r;
    }

    function getNextInterval(limit, offset){
        if (vxg.cameras.getCameraListPromise._last_update_utc + vxg.cameras.update_delay*1000 < Date.now()) return 0;
        if (!vxg.cameras.getCameraListPromise._last_update_utc) return offset;
        for (let i=offset; i<offset+limit; i++)
            if (vxg.cameras.continuous_list[i]===undefined)
                return i;
        return offset+limit;
    }

    let ret_list_promise = getExist(limit, offset);
    if (ret_list_promise!==false) return ret_list_promise;


    if (vxg.cameras.getCameraListPromise.promise){
        let _limit = limit, _offset = offset;
        return vxg.cameras.getCameraListPromise.promise.then(function(r){
            return vxg.cameras.getCameraListPromise(_limit, _offset);
        });
    }

    function _getCameraList(main_limit, main_offset, current_limit, current_offset, metafilter, metanotfilter, namefilter){
        let new_limit = main_limit > vxg.cameras.one_time_load_limit ? vxg.cameras.one_time_load_limit : main_limit;
        let new_offset = getNextInterval(new_limit, main_offset > current_offset ? main_offset : current_offset);
        new_limit = new_limit + window.vxg.cameras.preload_size > vxg.cameras.one_time_load_limit ? vxg.cameras.one_time_load_limit : window.vxg.cameras.preload_size + new_limit;

        let _main_limit = main_limit;
        let _main_offset = main_offset;
        let req = {limit:new_limit, offset:new_offset/*,meta_not:'isstorage'*/};
        if (metafilter) req.meta = metafilter;
//        if (metanotfilter) req.meta_not += ','+metanotfilter;
        if (metanotfilter) req.meta_not = metanotfilter;
        if (namefilter) req.name__icontains = namefilter;
        return vxg.api.cloud.getCamerasList(req).then(function(r){
            if (!r.meta){
                r.meta = {offset:r.offset, limit:r.limit, total_count:r.total};
            }
            if (!r.meta.next || _main_limit+_main_offset<=r.meta.limit+r.meta.offset) vxg.cameras.getCameraListPromise._last_update_utc = Date.now();
            for (let i in r.objects) {
                let is_exist = vxg.cameras.random_list[r.objects[i].id]!==undefined;

                vxg.cameras.random_list[r.objects[i].id] = new vxg.cameras.objects.Camera(r.objects[i].token ? r.objects[i].token : r.objects[i].id);
                vxg.cameras.random_list[r.objects[i].id].src = r.objects[i];

                if (!is_exist) vxg.cameras.random_list[r.objects[i].id]._last_limit_update_utc = 0;
                vxg.cameras.random_list[r.objects[i].id]._last_update_utc = Date.now();
                vxg.cameras.continuous_list[parseInt(r.meta.offset) + parseInt(i)] = vxg.cameras.random_list[r.objects[i].id];
            }
            vxg.cameras.total_cameras = r.meta.total_count;
            vxg.cameras.continuous_list.splice(vxg.cameras.total_cameras);

            let ret_list_promise = getExist(_main_limit, _main_offset);
            if (ret_list_promise!==false) {
                vxg.cameras.getCameraListPromise.promise = undefined;
                return ret_list_promise;
            }
            if (ret_list_promise===false && !r.meta.next) {
                console.error('Error retreiving camera list. May be vxg.cameras.update_delay='+vxg.cameras.update_delay+' seconds is low?');
                vxg.cameras.getCameraListPromise.promise = undefined;
                return [];
            }

            return _getCameraList(main_limit, main_offset, r.meta.limit, r.meta.offset);
        },function(){
            vxg.cameras.getCameraListPromise.promise = undefined;
            alert('Fail to get camera list');
        });
    }

    vxg.cameras.getCameraListPromise.promise = _getCameraList(limit, offset, 0, 0, metafilter, metanotfilter, namefilter);
    return vxg.cameras.getCameraListPromise.promise;
}


vxg.cameras.getLocations = function(limit, offset){
    if (limit===undefined) limit=50;
    if (offset===undefined) offset=0;

    return vxg.api.cloud.getLocations(vxg.user.src.allCamsToken).then(function(r){
        let ret = {};
        for (let i in r){
            ret[i+' ('+r[i]+')'] = vxg.support.md5(i).toLowerCase();
        }
        vxg.cameras.getLocations.metanotfilter='';
        for (let i in ret)
            vxg.cameras.getLocations.metanotfilter += (vxg.cameras.getLocations.metanotfilter?',':'')+'L+'+ret[i];
        ret['No location'] = '';
        return ret;
    });
}

/**
 * Get camera object. If the camera object is out of date, it will be loaded again.
 * Sample of use:
 *
 * vxg.cameras.getCameraByIDPromise(214361).then(function(cam_object){
 *   console.log(cam_object);
 * });
 */
vxg.cameras.getCameraByIDPromise = function(camera_id, camtoken){
    let _camera_id = parseInt(camera_id);
    if (vxg.cameras.getCameraByIDPromise.promises && vxg.cameras.getCameraByIDPromise.promises[_camera_id])
        return vxg.cameras.getCameraByIDPromise.promises[_camera_id];
    let camera = vxg.cameras.random_list[_camera_id];
    if (camera!==undefined /*&& camera._last_update_utc + vxg.cameras.update_delay*1000 > Date.now()*/) {
        let ret = new Promise(function(resolve, reject){this.timer_id = setTimeout(function(){resolve(camera);}, 0);});
        ret.cancel = function(){if (this.timer_id) clearTimeout(this.timer_id);};
        return ret;
    }
    return vxg.api.cloud.getCameraInfo(camera_id).then(function(r){
        vxg.cameras.random_list[r.id] = new vxg.cameras.objects.Camera(r.token ? r.token : r.id);
        vxg.cameras.random_list[r.id].src = r;
        return vxg.cameras.random_list[r.id];
    });
//TODO: load camera
    return new Promise(function(resolve, reject){setTimeout(function(){resolve();}, 0);});
}

vxg.cameras.getCameraByTokenPromise = function(token){
    for (let i in vxg.cameras.random_list)
        if (vxg.cameras.random_list[i].token==token){
            let ret = vxg.cameras.random_list[i];
            return new Promise(function(resolve, reject){setTimeout(function(){resolve(ret);}, 0);});
        }
    let cam = new vxg.cameras.objects.Camera(token);
    vxg.cameras.random_list[cam.camera_id] = cam;
    return new Promise(function(resolve, reject){setTimeout(function(){resolve(cam);}, 0);});
}

vxg.cameras.invalidate = function(){
    delete vxg.cameras.getCameraListPromise._last_update_utc;
    delete vxg.cameras.random_list;
    vxg.cameras.random_list = {};
    delete vxg.cameras.continuous_list;
    vxg.cameras.continuous_list = [];
    delete total_cameras;
}

vxg.cameras.getCameraFrom = function(token_or_channel_id){
    if (!token_or_channel_id) return defaultPromise();

    if (token_or_channel_id[0]=='+'){
        let limit = parseInt(token_or_channel_id.substr(1));
        return vxg.cameras.getCameraListPromise(limit+1,0).then(function(list){
            let l=0;
            for(let i in list){
                if (l==limit){
                    return list[i];
                }
                l++;
            }
        });
    } else if (parseInt(token_or_channel_id)>0)
        return window.vxg.cameras.getCameraByIDPromise(parseInt(token_or_channel_id));
    else if (typeof token_or_channel_id==="string")
        return window.vxg.cameras.getCameraByTokenPromise(token_or_channel_id);
    else return defaultPromise();
}
