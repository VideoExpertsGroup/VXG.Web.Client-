/* ATTENTION: Do not edit this file for no good reason!!!. This is a kernel file, and the performance of the entire system depends on its contents. */

window.vxg = window.vxg || {};
vxg.user = vxg.user || {};
vxg.users = vxg.users || {};
vxg.users.objects = vxg.users.objects || {};

vxg.partners = vxg.partners || {};
vxg.partners.objects = vxg.partners.objects || {};


//////////////////////////////////////////////////
// Errors
vxg.links = vxg.links || {
error: 'https://help.videoexpertsgroup.com/',
camera_help: 'https://help.videoexpertsgroup.com/kb/sonnecting-ip-cameras'
}

//////////////////////////////////////////////////
// User api

vxg.user.getToken = function(){
    if (!window.firebase)
        return new Promise(function(resolve, reject){setTimeout(function(){reject();}, 0);});
    return Promise.resolve(firebase.auth().currentUser.getIdToken());
}

vxg.user.getUsedPlans = function(){
    return vxg.api.cloudone.user.getUsedPlans().then(function(r){
        return r.data;
    });
}

vxg.user.getAllCamsTokenMeta = function(){
    if (vxg.user && vxg.user.src && vxg.user.src.allCamsTokenMeta!==undefined)
        return new Promise(function(resolve, reject){resolve(vxg.user.src.allCamsTokenMeta);});
    return vxg.api.cloud.getGroupTokenInfo(vxg.user.src.allCamsToken).then(function(r){
        vxg.user.src.allCamsTokenMeta = {};
        for(let i in r.objects){
            vxg.user.src.allCamsTokenMeta[r.objects[i].tag] = r.objects[i].data;
        }
        return vxg.user.src.allCamsTokenMeta;
    });
}

vxg.user.getStorageChannelID = function(){
    return vxg.user.getAllCamsTokenMeta().then(function(meta){
        if (parseInt(meta.storage_channel_id)>0)
            return new Promise(function(resolve, reject){resolve(parseInt(meta.storage_channel_id));});
        return vxg.api.cloudone.camera.getStorageCamera().then(function(r){
            if (vxg.user && vxg.user.src && vxg.user.src.allCamsTokenMeta!==undefined)
                delete vxg.user.src.allCamsTokenMeta;
            if (!r) return 0;
            return parseInt(r['storage_channel_id']) || 0;
        });
    });
}


//////////////////////////////////////////////////
// User list functions

vxg.users.objects.User = function(src){
    this.src = src;
}

vxg.users.invalidate = function(){
    this.expired = 0;
    this.list = [];
}

vxg.users.getList = function(limit, offset){
    let self = this;
    let args = {};
    this.list = this.list || [];
    if (limit!==undefined) args.limit = limit;
    if (offset!==undefined) args.offset = offset;
    return vxg.api.cloudone.user.list(args).then(function(r){
        if (typeof r === "string")
            return new Promise(function(resolve, reject){setTimeout(function(){reject();}, 0);});

        self.total_count = r.total;
        self.expired = Date.now() + self.update_delay*1000;
        let ret = [];
        for (let i in r.data){
            self.list[r.data[i].id] = new vxg.users.objects.User(r.data[i]);
            ret.push(self.list[r.data[i].id]);
        }
        return ret;
    },function(r){
        
    });
}

vxg.users.getUserByID = function(userid){
    return this.list[userid];
}

vxg.partners.getList = function (limit, offset) {
    let self = this;
    let args = {};
    this.list = this.list || [];
    if (limit !== undefined) args.limit = limit;
    if (offset !== undefined) args.offset = offset;
    return vxg.api.cloudone.partner.list(args).then(function (r) {
        self.total_count = r.total;
        self.expired = Date.now() + self.update_delay * 1000;
        let ret = {};
        ret.aiEnabled = r.aiEnabled;
        let partners = [];
        for (let i in r.data) {
            self.list[r.data[i].id] = new vxg.users.objects.User(r.data[i]);
            partners.push(self.list[r.data[i].id]);
        }
        ret.partners = partners;
        return ret;
    }, function (r) {

    });
}


////////////////////////////////////////////////
// Camera object extent

CloudOneCamera = {}

if (!vxg.cameras.objects.Camera) {
    vxg.cameras.objects.Camera = function(){}
    vxg.cameras.objects.Camera.prototype = CloudOneCamera;
} else {
    CloudOneCamera.__proto__ = vxg.cameras.objects.Camera.prototype;
    vxg.cameras.objects.Camera.prototype = CloudOneCamera;
}

CloudOneCamera.getEventTypes = function(){
    return vxg.api.cloudone.camera.getEventTypes(this.camera_id);
}
CloudOneCamera.setEventTypes = function(data){
    return vxg.api.cloudone.camera.setEventTypes(this.camera_id,data);
}

CloudOneCamera.setLocation = function(location){
    return vxg.api.cloudone.camera.setLocations(this.camera_id, location);
}
CloudOneCamera.setGroup = function(group){
    return vxg.api.cloudone.camera.setGroup(this.camera_id, group);
}
CloudOneCamera.shareCamera = function(time){
    return vxg.api.cloudone.camera.shareCamera(this.camera_id,time);
}
CloudOneCamera.getStorageCamera = function(){
    return vxg.api.cloudone.camera.getStorageCamera().then(function(r){
        return r['storage_channel_id'];
    });
}

CloudOneCamera.backupCamera = function(data){
    return vxg.api.cloudone.camera.backupCamera(this.camera_id,data);
}

/*
url
tz
name
location
lat
lon
desc
username 
password 
onvifRtspPort
isRecording
*/

CloudOneCamera.getBsrc = function(){
    let self = this;
    if (this.bsrc)
        return new Promise(function(resolve, reject){setTimeout(function(){resolve(self.bsrc)}, 0);});
    if (CloudOneCamera.getBsrc.promise) return CloudOneCamera.getBsrc.promise.then(function(){
        if (self.bsrc)
            return self.bsrc;
    });
    let ch = [];
    for (i in vxg.cameras.random_list)
        if (!vxg.cameras.random_list[i].bsrc)
            ch.push(vxg.cameras.random_list[i].camera_id);
    CloudOneCamera.getBsrc.promise = vxg.api.cloudone.camera.list({channelID:ch, limit:100, offset:0}).then(function(r){
        delete CloudOneCamera.getBsrc.promise;
        for (let i=0;i<r.data.length;i++)
            if (vxg.cameras.random_list[r.data[i].channelID]) vxg.cameras.random_list[r.data[i].channelID].bsrc = r.data[i];
        if (self.bsrc)
            return self.bsrc;
    });
    return CloudOneCamera.getBsrc.promise;
}

/**
 * Update camera.
 * Sample of use:
 *
 * vxg.cameras.updateCameraPromise({name: "New name"}).then(function(cam_object){
 *   console.log(cam_object;
 * });
 */

CloudOneCamera.updateCameraPromise = function(camera_struct){
    let self = this;
    // Call updateCameraPromise from CloudOne object
    return this.__proto__.__proto__.updateCameraPromise.apply(this, [camera_struct]).then(function(){
        //self.setLocation(camera_struct['location']);
        //self.setGroup(camera_struct['group']);
        return;
    });
}

CloudOneCamera.updateCameraPromise2 = function(camera_struct){
    if (camera_struct===this.camera){
        console.error('Do not use the same object - use only copy. Sample: camera = JSON.parse(JSON.stringify(camera))');
        return;
    }
    camera_struct.cameraID = this.camera_id;
    return vxg.api.cloudone.camera.update(camera_struct).then(function(){
        window.vxg.cameras.invalidate();
    });
      return vxg.api.cloudone.user.camera.add(obj);
};

/**
 * Delete camera.
 * Sample of use:
 *
 * vxg.cameras.getCameraByIDPromise(214531).then(function(cam_object){
 *   cam_object.deleteCameraPromise();
 * });
 */
CloudOneCamera.deleteCameraPromise = function(gatewayUrl = null){
    return vxg.api.cloudone.camera.del(this.camera_id, gatewayUrl).then(function(r){
        if (r['allCamsToken']!==undefined) {
            vxg.user.src.allCamsToken = r['allCamsToken'];
            vxg.api.cloud.setAllCamsToken(r['allCamsToken']);
        }
        window.vxg.cameras.invalidate();
        return r;
    });
};

CloudOneCamera.setPlans= function(plan_id){
    let self = this;
    let _plan_id = plan_id;
//      if (plan_id==this.bsrc.planID) return defaultPromise();
    return vxg.api.cloudone.camera.setPlans({id:this.camera_id,planid:plan_id}).then(function(r){
        window.vxg.cameras.invalidate();
        return r;
    });
}

vxg.cameras.createCameraPromise = function(camera_struct/* = {name: "no name", mode: "off", rec_mode: "off", rec_status: "off", timezone: "UTC"}*/){
    return vxg.api.cloudone.camera.add(camera_struct).then(function(r){
        if (r['allCamsToken']!==undefined) {
            vxg.user.src.allCamsToken = r['allCamsToken'];
            vxg.api.cloud.setAllCamsToken(r['allCamsToken']);
        }
        vxg.cameras.invalidate();
        return r;
    });
}

vxg.cameras.createCameraGatewayPromise = function(gatewayInfo){
    var data = {
        name: gatewayInfo.name,
        location: gatewayInfo.location,
        group: gatewayInfo.group,
        recording: 'off',
        gatewayId: gatewayInfo.guid,
        uuid: gatewayInfo.uuid,
        macAddress: gatewayInfo.guid,
        serialnumber: gatewayInfo.guid,
        max_num_cameras: 64
    }

    return vxg.api.cloudone.camera.add(data).then(function(r){
        if (r['allCamsToken']!==undefined) {
            vxg.user.src.allCamsToken = r['allCamsToken'];
            vxg.api.cloud.setAllCamsToken(r['allCamsToken']);
        }
        vxg.cameras.invalidate();

        return vxg.api.cloud.getCameraInfo(r.id).then(function(cam) {
            var cameraList = localStorage.cameraList ? JSON.parse(localStorage.cameraList) : null;
            cameraList.objects.push(cam);
            var total = parseInt(cameraList.meta.total_count);
            cameraList.meta.total_count = total + 1;
            localStorage.cameraList = JSON.stringify(cameraList);
    
            return cam;
        });
    });
}

vxg.cameras.createCameraDVRPromise = function(cameraInfo, dvrInfo){
    var data = {
        name: cameraInfo.name,
        dvrName: dvrInfo.dvrName,
        location: dvrInfo.location,
        group: dvrInfo.group,
        recording: 'off',
        tz: dvrInfo.tz,
        username: dvrInfo.username,
        password: dvrInfo.password,
        channel_number: cameraInfo.channel_number,
        uuid: dvrInfo.uuid
    }

    if (cameraInfo.isFirst) data.isFirst = true;

    if (dvrInfo.rtspPort) data.onvif_rtsp_port_fwd = dvrInfo.rtspPort;

    var httpPort = dvrInfo.httpPort ? dvrInfo.httpPort : 80;
    var url = 'http://' + dvrInfo.address + ':' + httpPort + '/dvr_camera/' + dvrInfo.type + '/' + cameraInfo.channel_number;
    data.url = url;

    return vxg.api.cloudone.camera.add(data).then(function(r){
        // add meta here?
        if (r['allCamsToken']!==undefined) {
            vxg.user.src.allCamsToken = r['allCamsToken'];
            vxg.api.cloud.setAllCamsToken(r['allCamsToken']);
        }
        vxg.cameras.invalidate();

        var cameraList = localStorage.cameraList ? JSON.parse(localStorage.cameraList) : null;
        cameraList.objects.push(r);
        var total = parseInt(cameraList.meta.total_count);
        cameraList.meta.total_count = total + 1;
        localStorage.cameraList = JSON.stringify(cameraList);

        return r;
    });
}

vxg.cameras.updateCameraDVRPromise = function(cameraInfo, formData){
    var currentMeta = cameraInfo.camera.meta;
    currentMeta.location = formData.location;
    currentMeta.dvr_name = formData.dvrName;

    var httpPort = formData.httpPort ? formData.httpPort : 80;
    var url = 'http://' + formData.address + ':' + httpPort + '/dvr_camera/' + formData.type + '/' + currentMeta.dvr_camera;

    if (currentMeta.dvr_first_channel) {
        var dvrObj = JSON.parse(currentMeta.dvr_first_channel);
        dvrObj.url = 'http://' + formData.address + ':' + httpPort;
        dvrObj.name = formData.dvrName;
        currentMeta.dvr_first_channel = JSON.stringify(dvrObj);
    }

    var data = {
        name: cameraInfo.name,
        tz: formData.tz,
        username: formData.username,
        password: formData.password,
        url: url,
        meta: currentMeta
    }

    if (formData.rtspPort) data.onvif_rtsp_port_fwd = formData.rtspPort;

    data.url = url;

    return vxg.api.cloud.getCameraInfo(cameraInfo.camera.id).then(function(r) {
        return vxg.api.cloud.updateCameraConfig(cameraInfo.camera.id, r.token, data).then(function(r){
            var cameraList = localStorage.cameraList ? JSON.parse(localStorage.cameraList) : null;
            if (cameraList) {
                var oldCamIndex = cameraList.objects.findIndex(c => c.id == r.id);
                cameraList.objects[oldCamIndex] = r;
                localStorage.cameraList = JSON.stringify(cameraList);
            }
            return r;
        });
    })

}

vxg.cameras.updateGatewayPromise = function(cameraInfo, formData){
    var currentMeta = cameraInfo.meta;
    currentMeta.location = formData.location;
    currentMeta.group = formData.group;

    var data = {
        meta: currentMeta
    }

    if (formData.name) {
        data.name = formData.name;
    }

    return vxg.api.cloud.getCameraInfo(cameraInfo.id).then(function(r) {
        return vxg.api.cloud.updateCameraConfig(cameraInfo.id, r.token, data).then(function(r){
            var cameraList = localStorage.cameraList ? JSON.parse(localStorage.cameraList) : null;
            if (cameraList) {
                var oldCamIndex = cameraList.objects.findIndex(c => c.id == r.id);
                cameraList.objects[oldCamIndex] = r;
                localStorage.cameraList = JSON.stringify(cameraList);
            }
            return r;
        });
    })

}

vxg.cameras.removeCameraFromListPromise = function(cameraId, gatewayUrl = null){
    return vxg.cameras.getCameraByIDPromise(cameraId).then(function(cam) {
        return cam.deleteCameraPromise(gatewayUrl).then(function(){ 
            var cameraList = localStorage.cameraList ? JSON.parse(localStorage.cameraList) : null;
            if (cameraList) {
                cameraList.objects = cameraList.objects.filter(c => c.id != cam.camera_id);
                var total = parseInt(cameraList.meta.total_count);
                cameraList.meta.total_count = total - 1;
                localStorage.cameraList = JSON.stringify(cameraList);
            }
        });
    })
}

vxg.cameras.getServersListPromise = function(limit, offset){
    let req = {limit:limit||1000, offset:offset||0};
    return vxg.api.cloudone.server.list(req);
}

vxg.cameras.getServerCamerasListPromise = function(server_id, limit, offset){
    let req = {server_id:server_id, limit:limit||1000, offset:offset||0};
    return vxg.api.cloudone.server.cameraslist(req).then(function(r){
        let ret=[];
        for (let i=0;i<r['data'].length;i++){
            ret[i] = new vxg.cameras.objects.Camera(r['data'][i].token ? r['data'][i].token : r['data'][i].id);
            ret[i].src = r['data'][i];
        }
        return ret;
    });
}

vxg.cameras.addServerPromise = function(uuid){
    return vxg.api.cloudone.server.add(uuid);
}
vxg.cameras.deleteServerPromise = function(id){
    return vxg.api.cloudone.server.del(id);
}
