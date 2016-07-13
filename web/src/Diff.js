const DebugInfo = require("./DebugInfo");
const StatusInfo = require("./StatusInfo");
const Controls = require("./Controls");
const DiffComponents = require("./DiffComponents");

const api_url = "/voiddiff/";

const Diff = {};
Diff.diffFiles = (files,callback)=>{
    StatusInfo.set(0);
    DebugInfo.set("startTime",(new Date).getTime());
    fetch("http://"+location.host+api_url+"0/",{
        method: 'post',
        body: files
    })
    .catch(e=>StatusInfo.set(-1))
    .then(e=>e.json())
    .then(callback);
};

Diff.diffString = (str1,str2,callback)=>{
    fetch("http://"+location.host+api_url+"1/"+encodeURIComponent(str1)+"/"+encodeURIComponent(str2))
    .catch(e=>StatusInfo.set(-1))
    .then(e=>e.json())
    .then(callback);
};

Diff.splitDiff = (data,callback)=>{
    DebugInfo.set('nodes_detail0',data.length);
    const _data = [];
    let buff=[];
    data.forEach(e=>{
        buff.push(e);
        const last = _data.length-1;
        const replaced =    _data[last] !== undefined &&
                            _data[last].length === 1 &&
                            buff.length === 1 &&
                            buff[0].type !== 0 &&
                            _data[last][0].type === -buff[0].type;

        if(replaced)
            _data[last].push(buff[0]);
        else
            _data.push(buff);
        buff=[];
    });
    Diff.detail1(_data,callback);
};

Diff.detail1 = (diff,callback)=>{
    let nodes_detail1 = 0;
    let counter = 0;
    for(let i=0;i<diff.length;i++){
        if(diff[i].length>=2)
            Diff.diffString(diff[i][0].text,diff[i][1].text,(e)=>{
                nodes_detail1 += e.length;
                diff[i] = e;
                if(++counter===diff.length){
                    DebugInfo.set('nodes_detail1',nodes_detail1);
                    detal1_done_helper(diff,callback);
                }
            });
        else {
            nodes_detail1++;
            if(++counter===diff.length){
                DebugInfo.set('nodes_detail1',nodes_detail1);
                detal1_done_helper(diff,callback);
            }
        }
    }
};

const detal1_done_helper = (diff,callback)=>{
    StatusInfo.set(2);
    DebugInfo.set("endTime",(new Date).getTime());
    DebugInfo.set("total_duration",(DebugInfo.data.endTime-DebugInfo.data.startTime)/1000);
    delete DebugInfo.data.startTime;
    delete DebugInfo.data.endTime;
    DebugInfo.update();
    callback(diff);
};

Diff.render = (diff)=>{
    const stats = {};
    stats.nodes_equal = 0;
    stats.nodes_insert = 0;
    stats.nodes_remove = 0;
    diff = diff.filter(e=>e.text.length>0);
    const buff = [];
    const diff_container = document.getElementsByClassName("js-diff-container")[0];
    diff_container.innerHTML='';

    Diff.splitDiff(diff,(diff_lines)=>{
        diff_lines.forEach(line=>{
            let changed = false;
            const line_left = [];
            const line_right = [];
            line.forEach(d=>{
                const type = d.type;
                const text = d.text;

                switch(type){
                    case 0:
                        stats.nodes_equal++;
                        line_left.push(DiffComponents.info(text,'c-diff__info--equal'));
                        line_right.push(DiffComponents.info(text));
                        break;
                    case 1:
                        changed=true;
                        stats.nodes_insert++;
                        line_right.push(DiffComponents.info(text,'c-diff__info--insert'));
                        break;
                    case -1:
                        changed=true;
                        stats.nodes_remove++;
                        line_left.push(DiffComponents.info(text,'c-diff__info--remove'));
                        break;
                }
            });

            const type_left = changed?'c-diff__text-line--old':'';
            const type_right = changed?'c-diff__text-line--new':'';
            const _ = DiffComponents.line(line_left,line_right,type_left,type_right);

            diff_container.appendChild(_);
        });
        DebugInfo.set('nodes_equal',stats.nodes_equal);
        DebugInfo.set('nodes_insert',stats.nodes_insert);
        DebugInfo.set('nodes_remove',stats.nodes_remove);
    });
};

Controls.diff = (files)=>Diff.diffFiles(files,Diff.render);