// This script is based on WSH Tree Explorer 1.7 by Br3tt! (so 99% of the credits have to go to Br3tt)
// you can get the original WSH panel script here:
// https://www.deviantart.com/br3tt/art/WSH-Tree-Explorer-1-7-196023730

window.DefinePanel('TripleQ_Filesystem', {author:'Q', features: {drag_n_drop: true}});

// Flags
DT_TOP = 0x00000000;
DT_LEFT = 0x00000000;
DT_END_ELLIPSIS = 0x00008000;
DT_SINGLELINE = 0x00000020;
DT_NOPREFIX = 0x00000800;
IDC_ARROW = 32512;
IDC_APPSTARTING = 32650;
MF_SEPARATOR = 0x00000800;
MF_STRING = 0x00000000;
MF_GRAYED = 0x00000001;
MF_DISABLED = 0x00000002;

// keys
var VK_UP = 38; //up cursor
var VK_DOWN = 40; //down cursor

// Image declarations (created in function set_images)
var folder_img;
var file_img;
var music_file_img;
var text_file_img;
var image_file_img;
var root_img;
var drive_img;
var cdrom_drive_img;
var ramdisk_drive_img;
var removable_drive_img;
var network_drive_img;
var favorites_img;
var computer_img;
var playlist_img;
var playlists_img;
var plus_img;
var minus_img;
var vcursor_img;

// Properties
var default_file_filters = "mp2;mp3;mp4;m4a;aac;ape;flac;wma;ogg;wav;wv;txt;nfo;jpg;png;"
var default_archive_filters = "zip;rar;7z;"

var g_label_colour = RGB(255,255,255);
var g_filters_str = window.GetProperty("file type filter", default_file_filters + default_archive_filters);
var scrollbar_w = window.GetProperty("scrollbar width", 16);
var g_autocollapse = window.GetProperty("auto collapse", true);
var g_sort = window.GetProperty("sort items", true);
var g_sort_modified = window.GetProperty("sort by modified date", true);
var g_show_playlists = window.GetProperty("show playlists", false);
var g_show_favorites = window.GetProperty("show favorites", true);
var g_show_filesystem = window.GetProperty("show filesystem", true);

// node object
node = function () {
    var i;
    this.font1 = gdi.Font("Tahoma", 12, 0);
    this.font2 = gdi.Font("Tahoma", 12, 4);
    this.childchecked = false;
	this.create = function (label, path, level, idx, pidx, type, collapsed, modifieddate, pathsum) {
		this.label = label;
        this.path = path;
		this.level = level;
		this.idx = idx;
		this.pidx = pidx;
		this.type = type;
        this.enabled = true;
        this.ready = true;
		this.collapsed = collapsed;
		this.modifieddate = modifieddate;

		this.child = new Array();
		this.item = new Array();
		this.totalchilds = 0;
        this.totalitems = 0;
        // pathsum
        if(this.level>0) {
            this.pathsum = new Array();
            for(i=0;i<pathsum.length;i++) {
                this.pathsum.push(pathsum[i]);
            }
            this.pathsum.push(pidx);
        } else {
            this.pathsum = new Array();
        }

    // set ftype already at creation of the object to ensure that ALL files in the folder are found!
    if (this.type == "file") {
          for(i=this.label.length;i>=0;i--) {
              if(this.label.charAt(i)==".") break;
          }
          this.ftype = getType(this.label.substring(i+1, this.label.length));
        }

  }
	this.addchild = function (label, path, modifieddate) {
        this.totalchilds++;
		this.child.push(new node);
		this.child[this.child.length-1].create(label, path, this.level+1, this.child.length-1, this.idx, "folder", true, modifieddate, this.pathsum);
	}
	this.additem = function (label, path, modifieddate) {
        this.totalitems++;
		this.item.push(new node);
		this.item[this.item.length-1].create(label, path, this.level+1, this.item.length-1, this.idx, "file", true, modifieddate, this.pathsum);
	}
    this.checkpos = function (y) {
		this.Cx = Math.floor(tree_padx + xoffset + tree_indent_w*(this.level+1));
		this.Cy = Math.floor(tree_pady + y);
    }
    this.draw = function (gr, y) {
        gr.DrawLine(0, 0, window.Width, 0, 3, RGB(75,75,0));

        var icon_alpha = 255;
        var label_colour = g_label_colour;

		this.x = Math.floor(tree_padx + xoffset + tree_indent_w*(this.level+1));
		this.y = Math.floor(tree_pady + y);
        this.retro_indent_w = tree_indent_w;


        // we don't draw lines not visible
        if(this.y+tree_line_h<0 || this.y>wh) return true;
        // end.

        switch(this.type) {
        case "folder":
            var icon = folder_img;
            break;
        case "file":
            for(i=this.label.length;i>=0;i--) {
                if(this.label.charAt(i)==".") break;
            }
            //this.ftype = getType(this.label.substring(i+1, this.label.length));
            switch(this.ftype) {
                case "music":
                    var icon = music_file_img; break;
                case "text":
                    var icon = text_file_img; break;
                case "image":
                    var icon = image_file_img; break;
                case "archive":
                    var icon = archive_file_img; break;
                default:
                    var icon = file_img;
            }
            break;
        case "playlists":
            var icon = playlists_img;
            break;
        case "playlist":
            if(plman.IsAutoPlaylist(this.path)) {
                var icon = autoplaylist_img;
            } else {
                var icon = playlist_img;
            }
            break;
        case "favorites":
            var icon = favorites_img;
            break;
        case "favorite":
            var icon = folderfav_img;
            if(!fso.FolderExists(this.path)) {
                this.enabled = false;
                icon_alpha = 150;
                label_colour = RGB(150,150,150);
            } else {
                this.enabled = true;
                icon_alpha = 255;
                label_colour = g_label_colour;
            }
            break;
        case "computer":
            var icon = computer_img;
            break;
        case "drive":
            switch (this.stype) {
                case 0: var icon = drive_img; break; // Unknow drivetype
                case 1: var icon = removable_drive_img; break; // Removable
                case 2: var icon = drive_img; break; // fixed
                case 3: var icon = network_drive_img; break; // Network
                case 4: var icon = cdrom_drive_img; break; // CD-ROM
                case 5: var icon = drive_img; break; // RAM Disk
            }
            break;
        default:
            var icon = root_img;
        }
        // collapse/expand icon
        if(this.type!="root" && this.type!="file" && this.type!="playlist") {
            this.retro_indent_w += marker_indent_w;
            var marker = this.collapsed ? plus_img : minus_img;
            if(!(this.childchecked && this.child.length==0 && this.item.length==0)) {
                gr.DrawImage(marker, this.x-tree_indent_w-marker_indent_w, this.y+2, marker.Width, marker.Height, 0, 0, marker.Width, marker.Height, 0, icon_alpha);
            }
        }
        // type icon
        gr.DrawImage(icon, this.x-20, this.y, icon.Width, icon.Height, 0, 0, icon.Width, icon.Height, 0, icon_alpha);
        // calc label width and offsets
        this.label_width = gr.CalcTextWidth(this.label, this.font1);

        if(this.label_width>ww-this.x) {
            var focus_w = ww - this.x - 4;
            // width of the max offset truncated part of label (used to stop horizontal scrolling in mouse.move)
            g_max_hdelta = (this.label_width - focus_w + 4) > g_max_hdelta ? (this.label_width - focus_w + 4) : g_max_hdelta;
        } else {
            var focus_w = this.label_width;
        }
        // Draw focus rect
		if(this.focus && this.type!="root") {
            gr.DrawRoundRect(this.x-22, this.y-3, focus_w+28, tree_line_h, 1, 1, 1, RGBA(255,255,255,100));
            gr.FillRoundRect(this.x-22, this.y-2, focus_w+28, tree_line_h, 1, 1, RGBA(100,100,100,50));
        }

       // add hovering focus indicator to root
    if (this.hover && this.type=="root") {
      gr.FillEllipse(7, 5, 10, 10, RGB(190,220,250));
      gr.DrawLine(17, 11, 192, 11, 1, RGB(255,255,255));
    }
        // Draw label
		gr.GdiDrawText(this.label, (this.hover && !this.marker_hover && this.type!="root" ? this.font2 : this.font1), label_colour, this.x, this.y, ww-this.x-3, tree_line_h, DT_LEFT | DT_TOP | DT_END_ELLIPSIS | DT_SINGLELINE | DT_NOPREFIX);

    // TODO add playlist duration and song-count etc.
    if (this.type == "playlist") {
      if (window.Width > 400) {
      gr.GdiDrawText("[" + this.playlist_count + "]", (this.hover && !this.marker_hover && this.type!="root" ? this.font2 : this.font1), label_colour, this.x + 250, this.y, ww-this.x-3, tree_line_h, DT_LEFT | DT_TOP | DT_END_ELLIPSIS | DT_SINGLELINE | DT_NOPREFIX);
      }
      if (window.Width > 500) {
        gr.GdiDrawText(this.playlist_duration, (this.hover && !this.marker_hover && this.type!="root" ? this.font2 : this.font1), label_colour, this.x + 320, this.y, ww-this.x-3, tree_line_h, DT_LEFT | DT_TOP | DT_END_ELLIPSIS | DT_SINGLELINE | DT_NOPREFIX);
      }
    }

	}
    this.checkmouse = function (event, x, y) {
        var i;
        var tmp_retro_indent_w = this.retro_indent_w - tree_indent_w;
        this.marker_hover = (x>this.x-this.retro_indent_w+tmp_retro_indent_w)?false:true;
        if(this.label_width>ww-this.x) {
            var text_area_w = ww-this.x;
        } else {
            var text_area_w = this.label_width;
        }
        this.hover = (x>this.x-this.retro_indent_w && x<this.x+text_area_w && y>this.y && y<this.y+tree_line_h) ? true : false;
        switch(event) {
            case "down":
                if(!this.enabled) {
                    this.hover = false;
                    return true;
                }
                if(this.hover && !this.marker_hover) {
                    reset_node_focus(root);
                    this.focus = true;
                }

                if(g_autocollapse) {
                    if(this.hover && this.collapsed) {
                        collapse_all(root);
                        var r = "root";
                        for(i=1;i<this.pathsum.length;i++) {
                            r = r + ".child[" + this.pathsum[i] + "]";
                            eval(r).collapsed = false;
                        }
                    }
                }

                if(this.hover){
                    this.holded = true;
                    switch(this.type){
                        case "drive":
                        case "folder":
                        case "favorite":
                        case "favorites":
                        case "computer":
                        case "playlists":
                            // check if drive ready before resuming
                            if(this.type=="drive") {
                                if(!fso.FolderExists(this.path)) {
                                    window.Repaint();
                                    return true;
                                }
                            }
                            // exemple de clonage de noeud: tmp_item = new objClone(this,true);
                            if(this.collapsed && !this.childchecked) {
                                window.SetCursor(IDC_APPSTARTING);
                                FillTreeLevel(this.path, this);
                                window.SetCursor(IDC_ARROW);
                            }
                            this.collapsed = this.collapsed?false:true;

                            if(!this.marker_hover) {
                                if(g_autocollapse) yoffset = 0;
                                cline_counter = 0;
                                scan_expanded(null, root, false);
                                if(g_autocollapse) {
                                    if(this.Cy>wh-tree_line_h) {
                                        yoffset = yoffset - this.Cy + wh/2;
                                        if(yoffset>0) yoffset = 0;
                                    }
                                }
                            }

                            g_max_hdelta = 0;
                            window.Repaint();
                            break;
                        case "playlist":
                            plman.ActivePlaylist = this.idx;
                            window.Repaint();
                            break;
                        case "file":
                            window.Repaint();
                            break;
                        case "root":
                            show_context_menu(this, x, y);
                            window.Repaint();
                            break;
                        default:
                    }
                } else {
                    if(redraw_drives) window.Repaint();
                }
                break;
            case "up":
                if(!this.enabled) return true;
                if(this.holded) {
                    // actions on mouse up if item holded by a mouse down
                    // end.
                    this.holded = false;
                }
                break;
            case "move":
                if(!this.enabled) return true;
                if(this.hover && !this.marker_hover) {
                    if(g_tooltip.Text!=this.label) {
                        g_tooltip.Deactivate();
                        g_tooltip.Text = this.label;
                    }
                    if(this.x+this.label_width>ww) {
                        g_tooltip.Activate();
                    } else {
                        g_tooltip.Deactivate();
                        g_tooltip.Text="";
                    }
                    if(this.y>tree_line_h*-1 && this.y<wh) {
                        if(!this.hover_prec) window.RepaintRect(this.x, Math.floor(this.y), this.label_width, tree_line_h);
                    }
                    this.hover_prec = true;
                } else {
                    if(this.y>tree_line_h*-1 && this.y<wh) {
                        if(this.hover_prec) window.RepaintRect(this.x, Math.floor(this.y), this.label_width, tree_line_h);
                    }
                    this.hover_prec = false;
                }
                break;
            case "dblclick":
                if(!this.enabled) return true;
                if(this.hover && this.type=="file") {
                    switch(this.ftype) {
                        case "archive":
                            var tmppath = fb.FoobarPath;
                            WshShell.Run("\"" + tmppath + "foobar2000.exe" + "\"" + " /immediate "+"\""+this.path+"\"");
                            break;
                        case "music":
                            var tmppath = fb.FoobarPath;
                            WshShell.Run("\"" + tmppath + "foobar2000.exe" + "\"" + " /immediate "+"\""+this.path+"\"");
                            break;
                        case "text":
                            WshShell.Run("%windir%\\notepad.exe "+this.path);
                            break;
                        case "image":
                            WshShell.Run("rundll32.exe %windir%\\System32\\shimgvw.dll,ImageView_Fullscreen "+this.path);
                            break;
                        // default:
                        //     WshShell.Exec("%comspec% /c start "+fso.Getfile(this.path))
                      }
                } else if (this.hover && this.type=="folder") {
                  // TODO add a check if folder is too large before adding it to the playlist on double-click
                  var tmppath = fb.FoobarPath;
                  var oFolder = fso.GetFolder(this.path);

                  let foldersize = oFolder.Size

                  // only add folders on double-click if they contain less than 2 subfolders
                  if (Math.round(foldersize / 1000000) < 600) {
                    WshShell.Run("\"" + tmppath + "foobar2000.exe" + "\"" + " /immediate "+"\""+this.path+"\"");
                    this.collapsed = true;
                    window.Repaint();
                  } else{
                    let html_data= "";
                    html_data += "<html>";
                    html_data += "<head>";
                    html_data += "<title>" + " Too large folder for double-click! " + "</title>";
                    html_data += "<style rel=\"stylesheet\" type=\"text/css\">";
                    html_data += "body {font-family: Segoe UI; font-size: 14px;background-color: #252525; color: #FFFFFF;}";
                    html_data += "</style>";
                    html_data += "</head>";
                    html_data += "<body>";
                    html_data += "You double-clicked on a folder with " +  oFolder.SubFolders.Count + " sub-folders... and a size of ~" + utils.FormatFileSize(foldersize);
                    html_data += "</body>";
                    html_data += "</html>";


                    if (fb.AlwaysOnTop) {
                        fb.AlwaysOnTop = false
                        utils.ShowHtmlDialog(window.id, html_data, {
                            width:300,
                            height:100,
                            resizable:false,
                            scroll:false})
                        fb.AlwaysOnTop = true
                    } else {
                        utils.ShowHtmlDialog(window.id, html_data, {
                            width:300,
                            height:100,
                            resizable:false,
                            scroll:false})
                    }

                  }
                }
                break;
            case "leave":
                this.hover = false;
                this.hover_prec = false;
                break;
            case "right":
                if(this.hover) {
                    reset_node_focus(root);
                    this.focus = true;
                }
                if(this.hover) {
                    switch(this.type) {
                        case "drive":
                            if(this.ready) show_context_menu(this, x, y);
                            break;
                        default:
                            show_context_menu(this, x, y);
                            break;
                    }
                }
                break;
        }
    }
}


// main Tools
function RGB(r, g, b) {
    return (0xff000000 | (r << 16) | (g << 8) | (b));
}

function RGBA(r, g, b, a) {
    return ((a << 24) | (r << 16) | (g << 8) | (b));
}

function getType(ftype) {
    return FileType[ftype.toLowerCase()];
}

var FileType = {
    "mp2": "music",
    "mp3": "music",
    "mp4": "music",
    "m4a": "music",
    "mpc": "music",
    "ogg": "music",
    "flac": "music",
    "wma": "music",
    "wav": "music",
    "ape": "music",
    "aac": "music",
    "zip": "archive",
    "rar": "archive",
    "7z": "archive",
    "txt": "text",
    "nfo": "txt",
    "jpg": "image",
    "png": "image"
}

var vb = {};
vb.Function = function (func) {
    return function () {
        return vb.Function.eval.call(this, func, arguments);
    };
};
vb.Function.eval = function (func) {
    var args = Array.prototype.slice.call(arguments[1]);
    for (var i = 0;
    i < args.length;
    i++) {
        if (typeof args[i] != 'string') {
            continue;
        }
        args[i] = '"' + args[i].replace(/"/g, '" + Chr(34) + "') + '"';
    }
    var vbe;
    vbe = new ActiveXObject('ScriptControl');
    vbe.Language = 'VBScript';
    return vbe.eval(func + '(' + args.join(', ') + ')');
};
//var InputBox = vb.Function('InputBox');
//var MsgBox = vb.Function('MsgBox');
vb.OKOnly = 0;
vb.OKCancel = 1;
vb.AbortRetryIgnore = 2;
vb.YesNoCancel = 3;
vb.YesNo = 4;
vb.RetryCancel = 5;
vb.Critical = 16;
vb.Question = 32;
vb.Exclamation = 48;
vb.Information = 64;
vb.DefaultButton1 = 0;
vb.DefaultButton2 = 256;
vb.DefaultButton3 = 512;
vb.DefaultButton4 = 768;
vb.ApplicationModal = 0;
vb.SystemModal = 4096;
vb.OK = 1;
vb.Cancel = 2;
vb.Abort = 3;
vb.Retry = 4;
vb.Ignore = 5;
vb.Yes = 6;
vb.No = 7;

function objClone(what, rec) {
    for (var i in what) {
       if ((rec) && (typeof what[i]=="object"))
           this[i] = new objClone(what[i],true);
       else
           this[i] = what[i];
    }
}

function sort_tab(tab2sort, sort_by_modified_date) {
    var tab = new Array();
    var i, j;
    var tmp = new node;
    if (sort_by_modified_date == false) {
        for(i=0;i<tab2sort.length;i++) {
            for(j=i;j<tab2sort.length;j++) {
                var uselabel0 = tab2sort[i][0] // first entry is the NAME of the file or folder!
                var uselabel1 = tab2sort[j][0]

                if(uselabel0.toUpperCase() > uselabel1.toUpperCase()) {
                    tmp = tab2sort[i];
                    tab2sort[i] = tab2sort[j];
                    tab2sort[j] = tmp;
                }
            }
            tab.push(tab2sort[i]);
            tab[i].idx = i;
        }
    } else {
        for(i=0;i<tab2sort.length;i++) {
            for(j=i;j<tab2sort.length;j++) {
                var uselabel0 = tab2sort[i][2] // third entry is the MODIFIED DATE of the file or folder!
                var uselabel1 = tab2sort[j][2]

                if(uselabel0 < uselabel1) {
                    tmp = tab2sort[i];
                    tab2sort[i] = tab2sort[j];
                    tab2sort[j] = tmp;
                }
            }
            tab.push(tab2sort[i]);
            tab[i].idx = i;
        }
    }
    return tab;
}


// Tree Tools
function scan_expanded(gr, noeud, draw) {
	var i, j
    if(draw) {
        noeud.draw(gr, yoffset + line_counter*tree_line_h);
        line_counter++;
    } else {
        noeud.checkpos(yoffset + cline_counter*tree_line_h);
        cline_counter++;
    }
    if(!noeud.collapsed) {
        for(i=0;i<noeud.child.length;i++) {
            scan_expanded(gr, noeud.child[i], draw);
        }
        for(j=0;j<noeud.item.length;j++) {
            if(draw) {
                noeud.item[j].draw(gr, yoffset + line_counter*tree_line_h);
                line_counter++;
            } else {
                noeud.item[j].checkpos(yoffset + cline_counter*tree_line_h);
                cline_counter++;
            }
        }
    }
}

function scan_check_all(noeud, event, x, y) {
	var i, j;
    // node action below
    noeud.checkmouse(event, x, y);
    // end.
    if(!noeud.collapsed) {
        for(i=0;i<noeud.child.length;i++) {
            scan_check_all(noeud.child[i], event, x, y);
        }
        for(j=0;j<noeud.item.length;j++) {
            noeud.item[j].checkmouse(event, x, y);
        }
    }
}

function reset_node_focus(noeud) {
	var i, j;
    noeud.focus = false;
    for(i=0;i<noeud.child.length;i++) {
        reset_node_focus(noeud.child[i]);
    }
    for(j=0;j<noeud.item.length;j++) {
        noeud.item[j].focus = false;
    }
}

function collapse_all(noeud) {
	var i, j;
    if(noeud.level>1) noeud.collapsed = true;
    for(i=0;i<noeud.child.length;i++) {
        collapse_all(noeud.child[i]);
    }
}


/// TODO
function FillTreeLevel(path, node) {
    var i;
    var item_fld, item_file;
    var oFolder = fso.GetFolder(path);
    var oFolders = new Enumerator(oFolder.SubFolders);
    var oFiles = new Enumerator(oFolder.Files);
    node.childchecked = true;

    let found_folders = [];
    let found_archives = [];
    let found_files = [];

    // make sure filter-lists are uppercase
    for(var i = 0; i < g_filters_arr.length; i++){
        g_filters_arr[i] = g_filters_arr[i].toUpperCase();
    }
    for(var i = 0; i < g_filters_arr_archives.length; i++){
        g_filters_arr_archives[i] = g_filters_arr_archives[i].toUpperCase();
    }

    // loop through folders
    for (oFolders.moveFirst(); !oFolders.atEnd(); oFolders.moveNext()) {
        item_fld = oFolders.item();
        // ajout nouveau noeud
        if(item_fld.Attributes==16 || item_fld.Attributes==17 || item_fld.Attributes==2064) {
            found_folders.push([item_fld.Name, item_fld.Path, item_fld.DateLastModified])
        }
    }

    // checking for files in the current folder
    for (oFiles.moveFirst(); !oFiles.atEnd(); oFiles.moveNext()) {
        item_file = oFiles.item();
        item_file_split = item_file.Name.split('.');
        if (item_file_split.length == 2){
            item_file_suffix = item_file_split[1].toUpperCase()
            if (g_filters_arr_archives.includes(item_file_suffix)) {
                found_archives.push([item_file.Name, item_file.Path, item_file.DateLastModified])
            } else if (g_filters_arr.includes(item_file_suffix)) {
                found_files.push([item_file.Name, item_file.Path, item_file.DateLastModified])
            }
        } else {
            continue;
        }
    }

    // first add sorted folders
    if (found_folders.length > 0) {
        found_folders = sort_tab(found_folders, g_sort_modified)
        for (let i = 0; i < found_folders.length; i++) {
            item = found_folders[i]
            node.addchild(...item);
        }
    }
    // then add sorted archives
    if (found_archives.length > 0) {
        found_archives = sort_tab(found_archives, g_sort_modified)
        for (let i = 0; i < found_archives.length; i++) {
            item = found_archives[i]
            node.additem(...item);
        }
    }
    // then add sorted files (always sort files alphabetically!)
    if (found_files.length > 0) {
        found_files = sort_tab(found_files, false)
        for (let i = 0; i < found_files.length; i++) {
            item = found_files[i]
            node.additem(...item);
        }
    }

}

function FillFilters(filterstr) {
    var i;
    var txt = "";
    var arr = new Array();
    for(i=0;i<filterstr.length;i++) {
        if(filterstr.charAt(i)==";") {
            arr.push(txt);
            txt = "";
        } else {
            txt = txt + filterstr.charAt(i);
        }
    }
    if(txt.length>0) arr.push(txt);
    return arr;
}

function FillFavorites(noeud) {
    var i;
    var count = 0;
    var arr = new Array();
    g_fav_total = window.GetProperty("fav total", 0);
    g_fav_labels = window.GetProperty("fav labels", "");
    g_fav_paths = window.GetProperty("fav paths", "");
    var txt = "";
    for(i=0;i<g_fav_labels.length;i++) {
        if(g_fav_labels.charAt(i)==";") {
            arr.push(txt);
            txt = "";
        } else {
            txt = txt + g_fav_labels.charAt(i);
        }
    }
    if(txt.length>0) arr.push(txt);
    txt = "";
    for(i=0;i<g_fav_paths.length;i++) {
        if(g_fav_paths.charAt(i)==";") {
            noeud.addchild(arr[count], txt, "000");
            noeud.child[count].type = "favorite";
            count++;
            txt = "";
        } else {
            txt = txt + g_fav_paths.charAt(i);
        }
    }
    if(txt.length>0) {
        noeud.addchild(arr[count], txt, "000");
        noeud.child[count].type = "favorite";
    }
}

function FillDrives(noeud) {
    var drv;
    var e = new Enumerator(fso.Drives);
    for (; !e.atEnd(); e.moveNext()) {
        drv = e.item();
        if ((drv.IsReady || drv.DriveType==4) && (drv.DriveType!=5)) {
            if (!drv.IsReady && drv.DriveType==4) {
                noeud.addchild("N/A"+" ("+drv.DriveLetter.toUpperCase()+":) ", drv.DriveLetter.toUpperCase()+":\\", "000");
                noeud.child[noeud.child.length-1].ready = false;
            } else if (drv.IsReady) {
                var freeGB = drv.FreeSpace / bytesPerGB;
                var totalGB = drv.TotalSize / bytesPerGB;
                noeud.addchild((drv.VolumeName?drv.VolumeName+" ":"")+"("+drv.DriveLetter.toUpperCase()+":) "+Math.floor(freeGB.toFixed(3)*10)/10+"GB/"+Math.floor(totalGB.toFixed(3)*10)/10+"GB", drv.Path+"\\", "000");
                noeud.child[noeud.child.length-1].ready = true;
            }
            noeud.child[noeud.child.length-1].type = "drive";
            noeud.child[noeud.child.length-1].stype = drv.DriveType;
            drive_counter++;
        }
    }
}

function FillPlaylists(noeud) {
    var i;
    for (i = 0; i < plman.PlaylistCount; i++) {
        let plitems = plman.GetPlaylistItems(i)
        noeud.addchild(plman.GetPlaylistName(i), i, "000");
        noeud.child[noeud.child.length-1].type = "playlist";
        noeud.child[noeud.child.length-1].playlist_duration = utils.FormatDuration(plitems.CalcTotalDuration());
        noeud.child[noeud.child.length-1].playlist_count = plitems.Count;

        playlist_counter++;
    }
}

function getCpos(y) {
    return (y*-1) / (line_counter*tree_line_h-wh) * (wh-vcursor_h);
}

function getYoffset(y) {
    return (y*-1) / (wh-vcursor_h) * (line_counter*tree_line_h-wh);
}

function refresh_drives() {
    var i, temp_node;
    redraw_drives = false;
    for(i=0;i<root.child[g_filesystem_node_idx].child.length;i++) {
        temp_node = root.child[g_filesystem_node_idx].child[i];
        // check if drive ready before resuming
        if(temp_node.type=="drive") {
            try {
                var chkdrv = fso.GetDrive(fso.GetDriveName(temp_node.path));
                if(!chkdrv.IsReady) {
                    if(temp_node.ready) redraw_drives = true;
                    temp_node.ready = false;
                    temp_node.label = "N/A"+" ("+chkdrv.DriveLetter.toUpperCase()+":) ";
                    temp_node.child.splice(0,temp_node.child.length);
                    temp_node.item.splice(0,temp_node.item.length);
                    temp_node.childchecked = true;
                } else {
                    if(!temp_node.ready) redraw_drives = true;
                    temp_node.ready = true;
                    var freeGB = chkdrv.FreeSpace / bytesPerGB;
                    var totalGB = chkdrv.TotalSize / bytesPerGB;
                    temp_node.label = (chkdrv.VolumeName?chkdrv.VolumeName+" ":"")+"("+chkdrv.Path+") "+Math.floor(freeGB.toFixed(3)*10)/10+"GB/"+Math.floor(totalGB.toFixed(3)*10)/10+"GB";
                }
            } catch(e) {
                root.child[g_filesystem_node_idx].child.splice(i,1);
            }
        }
    }
}

// main globals
var WshShell = new ActiveXObject("WScript.Shell");
var fso = new ActiveXObject("Scripting.FileSystemObject");
var g_tooltip = window.CreateTooltip();
var g_font = gdi.Font("Tahoma", 12, 0);
var ww, wh;
var mouse_x, mouse_y;
var xoffset=0;
var yoffset=0;
var g_drag = false;
var c_drag = false;
var reset = false;
var bytesPerGB = 1024 * 1024 * 1024;
var redraw_drives = false;

// tree globals
var root = new node;
var tree_indent_w = 20;
var marker_indent_w = 14;
var tree_line_h = 18;
var tree_padx = 2;
var tree_pady = 2;
var line_counter;
var cline_counter;
var favorites_counter;
var drive_counter;
var playlist_counter;
var tmp_item;
var g_fav_total = 0;
var g_fav_labels = "";
var g_fav_paths = "";
var g_filters_arr;
var g_filters_arr_archives;
var g_max_hdelta = 0;
var vcursor_w = scrollbar_w;
var vcursor_h = 20;

function on_size() {
    window.DlgCode = 0x0001;

    var i;
	ww = window.Width;
	wh = window.Height;

    g_playlists_node_idx = -1;
    g_favorites_node_idx = -1;
    g_filesystem_node_idx = -1;

    if(g_show_playlists) {
        g_playlists_node_idx = 0;
        if(g_show_favorites) {
            g_favorites_node_idx = 1;
            if(g_show_filesystem) {
                g_filesystem_node_idx = 2;
            }
        } else {
            if(g_show_filesystem) {
                g_filesystem_node_idx = 1;
            }
        }
    } else {
        if(g_show_favorites) {
            g_favorites_node_idx = 0;
            if(g_show_filesystem) {
                g_filesystem_node_idx = 1;
            }
        } else {
            if(g_show_filesystem) {
                g_filesystem_node_idx = 0;
            }
        }
    }

    // build of all images
    set_images();

    // filling of the filter array from the properties field
    g_filters_arr = FillFilters(g_filters_str);
    g_filters_arr_archives = FillFilters(default_archive_filters);

    if(typeof(root.label)=="undefined" || reset) {
        root.create("", "", 0, 0, null, "root", false, null, "000");
        root.childchecked = true;
        // playlists
        if(g_show_playlists) {
            root.addchild("Playlists", "", "000");
            root.child[g_playlists_node_idx].childchecked = true;
            root.child[g_playlists_node_idx].type = "playlists";
            playlist_counter = 0;
            FillPlaylists(root.child[g_playlists_node_idx]);
        }
        // favorites
        if(g_show_favorites) {
            root.addchild("Favorites", "", "000");
			root.child[g_favorites_node_idx].collapsed = 0
            root.child[g_favorites_node_idx].childchecked = true;
            root.child[g_favorites_node_idx].type = "favorites";
            favorites_counter = 0;
            FillFavorites(root.child[g_favorites_node_idx]);
        }
        // drives
        if(g_show_filesystem) {
            root.addchild("Computer", "", "000");
            root.child[g_filesystem_node_idx].childchecked = true;
            root.child[g_filesystem_node_idx].type = "computer";
            drive_counter = 0;
            FillDrives(root.child[g_filesystem_node_idx]);
        }
        //
        reset = false;
    }
}

function on_paint(gr) {
    gr.FillSolidRect(0, 0, window.Width, window.Height, RGB(37, 37, 37));
    if(cline_counter==0 && !c_drag) {
        scan_expanded(null, root, false);
    }
    if(cline_counter*tree_line_h>wh || line_counter*tree_line_h>wh) {
        ww = window.Width - scrollbar_w;
    } else {
        ww = window.Width;
    }
    cline_counter = 0;
    line_counter = 0;
    scan_expanded(gr, root, true);
    // vscrollbar
    if(line_counter*tree_line_h>wh) {
        gr.DrawLine(ww,0,ww,wh,1.0,RGBA(100,100,100,50));
        gr.DrawImage(vcursor_img, ww, getCpos(yoffset), vcursor_img.Width, vcursor_img.Height, 0, 0, vcursor_img.Width, vcursor_img.Height, 0, c_drag?255:130);
    }
}

function on_mouse_lbtn_down(x, y) {
    // check drives
    if(g_show_filesystem) refresh_drives();
    // end.
    if(x<ww) {
	    g_drag = true;
        scan_check_all(root, "down", x, y);
    } else {
        if(line_counter*tree_line_h>wh) {
            c_drag = true;
            if(y>getCpos(yoffset) && y<getCpos(yoffset)+vcursor_h) {
                window.RepaintRect(ww, getCpos(yoffset), vcursor_w, vcursor_h);
            } else {
                yoffset = getYoffset(y-vcursor_h/2);
                if(yoffset>0) yoffset = 0;
                if(yoffset<(tree_line_h*line_counter-wh)*-1) yoffset = (tree_line_h*line_counter-wh)*-1;
                window.Repaint();
            }
        } else {
            c_drag = false;
            yoffset = 0;
            window.Repaint();
        }
    }
}

function on_mouse_lbtn_dblclk(x, y) {
    scan_check_all(root, "dblclick", x, y);
}


function on_mouse_lbtn_up(x, y) {
    g_drag = false;
    scan_check_all(root, "up", x, y);
    if(c_drag) {
        c_drag = false;
        window.RepaintRect(ww, getCpos(yoffset), vcursor_w, vcursor_h);
    }
}

function on_mouse_rbtn_down(x, y) {
    // check drives
    if(g_show_filesystem) refresh_drives();
    // end.
    scan_check_all(root, "right", x, y);
}

function on_mouse_move(x, y) {

    scan_check_all(root, "move", x, y);

    if(g_drag) {
        if(x>mouse_x) {
            xoffset += tree_indent_w;
            if(xoffset>0) xoffset = 0;
            window.Repaint();
        } else if (x<mouse_x) {
            xoffset -= tree_indent_w;
            if(xoffset<g_max_hdelta*-1) {
                xoffset = g_max_hdelta*-1;
            }
            window.Repaint();
        }
    }

    if(c_drag) {
        yoffset = getYoffset(y-vcursor_h/2);
        if(yoffset>0) yoffset = 0;
        if(yoffset<(tree_line_h*line_counter-wh)*-1) yoffset = (tree_line_h*line_counter-wh)*-1;
        window.Repaint();
    }

    if(yoffset<(tree_line_h*line_counter-wh)*-1) { yoffset = (tree_line_h*line_counter-wh)*-1; if(yoffset>0) yoffset = 0; window.Repaint(); }

    mouse_x = x;
    mouse_y = y;
}

function on_mouse_wheel(delta) {
    if(delta>0) {
        yoffset+=tree_line_h*2;
        if(yoffset>0) yoffset = 0;
    } else if(tree_line_h*line_counter>wh-tree_pady) {
        yoffset-=tree_line_h*2;
        if(yoffset<(tree_line_h*line_counter-wh)*-1) yoffset = (tree_line_h*line_counter-wh)*-1;
    }
    window.Repaint();
}


function on_key_down(vkey) {
    //fb.trace(vkey)
    switch (vkey) {
        case VK_UP:
            on_mouse_wheel(1)
            break;
        case VK_DOWN:
            on_mouse_wheel(-1)
            break;
        }
}


function on_mouse_leave() {
    scan_check_all(root, "leave", 0, 0);
    window.Repaint();
}

function set_images() {
    var gb;

    plus_img = gdi.CreateImage(11, 11);
    gb = plus_img.GetGraphics();
    gb.SetSmoothingMode(2);
    //gb.FillGradRect(0, 0, 8, 8, 90, RGB(240,240,240), RGB(160,170,180));
    //gb.DrawRoundRect(0, 0, 8, 8, 1, 1, 1.0, RGB(160,160,160));
    gb.SetSmoothingMode(0);
    gb.FillSolidRect(4, 2, 1, 5, RGB(255, 255, 255));
    gb.FillSolidRect(2, 4, 5, 1, RGB(255, 255, 255));
    plus_img.ReleaseGraphics(gb);

    minus_img = gdi.CreateImage(11, 11);
    gb = minus_img.GetGraphics();
    gb.SetSmoothingMode(2);
    //gb.FillGradRect(0, 0, 8, 8, 90, RGB(240,240,240), RGB(160,170,180));
    //gb.DrawRoundRect(0, 0, 8, 8, 1, 1, 1.0, RGB(160,160,160));
    gb.SetSmoothingMode(0);
    gb.FillSolidRect(2, 4, 5, 1, RGB(255, 255, 255));
    minus_img.ReleaseGraphics(gb);

    favorites_img = gdi.CreateImage(25, 21);
    gb = favorites_img.GetGraphics();
    gb.SetSmoothingMode(2);
    var star_points = Array(2,5,7,5,9,0,11,5,16,5,12,8,14,13,9,10,4,13,6,8);
    gb.FillPolygon(RGB(240,240,120), 0, star_points);
    gb.DrawPolygon(RGB(150,150,080), 0, star_points);
    favorites_img.ReleaseGraphics(gb);

    folder_img = gdi.CreateImage(20, 16);
    gb = folder_img.GetGraphics();
    gb.SetSmoothingMode(2);
    //gb.FillGradRect(1, 1, 15, 11, 90, RGB(240,240,110), RGB(200,200,80));
    gb.DrawRoundRect(1, 1, 13, 10, 1, 1, 1, RGB(100,100,100));
    //gb.FillRoundRect(1, 0, 5, 4, 1, 1, RGB(240,240,80));
    gb.DrawRoundRect(1, 0, 5, 4, 1, 1, 1, RGB(100,100,100));
    //gb.FillGradRect(2, 2, 13, 9, 90, RGB(240,240,110), RGB(200,200,80));
    gb.SetSmoothingMode(0);
    //gb.FillGradRect(2, 2, 13, 9, 90, RGB(240,240,110), RGB(200,200,80));
    folder_img.ReleaseGraphics(gb);

    var ministar_img = gdi.CreateImage(25, 21);
    gb = ministar_img.GetGraphics();
    gb.SetSmoothingMode(2);
    var ministar_points = Array(2,5,7,5,9,0,11,5,16,5,12,8,14,13,9,10,4,13,6,8);
    gb.FillPolygon(RGB(170,170,080), 0, ministar_points);
    gb.DrawPolygon(RGB(140,140,070), 0, ministar_points);
    ministar_img.ReleaseGraphics(gb);

    folderfav_img = gdi.CreateImage(20, 16);
    gb = folderfav_img.GetGraphics();
    gb.SetSmoothingMode(2);
    //gb.FillGradRect(1, 1, 15, 11, 90, RGB(240,240,110), RGB(200,200,80));
    gb.DrawRoundRect(1, 1, 15, 11, 1, 1, 1, RGB(160,160,70));
    //gb.FillRoundRect(1, 0, 5, 4, 1, 1, RGB(240,240,80));
    gb.DrawRoundRect(1, 0, 5, 4, 1, 1, 1, RGB(160,160,60));
    //gb.FillGradRect(2, 2, 13, 9, 90, RGB(240,240,110), RGB(200,200,80));
    gb.SetSmoothingMode(0);
    //gb.FillGradRect(2, 2, 13, 9, 90, RGB(240,240,110), RGB(200,200,80));
    gb.DrawImage(ministar_img, 4, 3, ministar_img.Width-11, ministar_img.Height-10, 0, 0, ministar_img.Width, ministar_img.Height, 0, 255);
    folderfav_img.ReleaseGraphics(gb);

    file_img = gdi.CreateImage(20, 16);
    gb = file_img.GetGraphics();
    gb.SetSmoothingMode(2);
    //gb.FillRoundRect(3, 0, 12, 13, 1, 1, RGB(190,220,250));
    gb.DrawRoundRect(3, 0, 12, 13, 1, 1, 1, RGB(150,180,220));
    file_img.ReleaseGraphics(gb);

    archive_file_img = gdi.CreateImage(20, 16);
    gb = archive_file_img.GetGraphics();
    gb.SetSmoothingMode(2);
    //gb.FillRoundRect(3, 1, 5, 5, 1, 1, RGB(190,220,250));
    gb.DrawRoundRect(3, 1, 5, 5, 1, 1, 1, RGB(150,180,220));
    //gb.FillRoundRect(10, 1, 5, 5, 1, 1, RGB(190,220,250));
    gb.DrawRoundRect(10, 1, 5, 5, 1, 1, 1, RGB(150,180,220));
    //gb.FillRoundRect(3, 8, 5, 5, 1, 1, RGB(190,220,250));
    gb.DrawRoundRect(3, 8, 5, 5, 1, 1, 1, RGB(150,180,220));
    //gb.FillRoundRect(10, 8, 5, 5, 1, 1, RGB(190,220,250));
    gb.DrawRoundRect(10, 8, 5, 5, 1, 1, 1, RGB(150,180,220));
    archive_file_img.ReleaseGraphics(gb);

    music_file_img = gdi.CreateImage(20, 16);
    gb = music_file_img.GetGraphics();
    gb.SetSmoothingMode(2);
    //gb.FillRoundRect(3, 0, 12, 13, 1, 1, RGB(220,240,250));
    //gb.DrawRoundRect(3, 0, 12, 13, 1, 1, 1.0, RGB(150,180,220));
    gb.FillEllipse(5, 7, 6, 5, RGB(150,180,220));
    gb.DrawLine(10, 2, 11, 10, 1.0, RGB(150,180,220));
    gb.DrawLine(10, 2, 12, 3, 1.0, RGB(150,180,220));
    music_file_img.ReleaseGraphics(gb);

    text_file_img = gdi.CreateImage(20, 16);
    gb = text_file_img.GetGraphics();
    gb.SetSmoothingMode(2);
    //gb.FillRoundRect(3, 0, 12, 13, 1, 1, RGB(190,220,250));
    gb.DrawRoundRect(3, 0, 12, 13, 1, 1, 1, RGB(150,180,220));
    gb.SetSmoothingMode(0);
    gb.FillSolidRect(6, 04, 7, 1, RGB(150,150,150));
    gb.FillSolidRect(6, 06, 7, 1, RGB(150,150,150));
    gb.FillSolidRect(6, 08, 7, 1, RGB(150,150,150));
    gb.FillSolidRect(6, 10, 7, 1, RGB(150,150,150));
    text_file_img.ReleaseGraphics(gb);

    image_file_img = gdi.CreateImage(20, 16);
    gb = image_file_img.GetGraphics();
    gb.SetSmoothingMode(2);
    //gb.FillRoundRect(3, 0, 12, 13, 1, 1, RGB(190,220,250));
    //gb.DrawRoundRect(3, 0, 12, 13, 1, 1, 1.0, RGB(150,180,220));
    gb.SetSmoothingMode(0);
    gb.FillSolidRect(6, 04, 7, 7, RGB(250,250,250));
    gb.FillSolidRect(7, 05, 5, 5, RGB(150,220,150));
    image_file_img.ReleaseGraphics(gb);

    root_img = gdi.CreateImage(200, 16);
    gb = root_img.GetGraphics();
    gb.SetSmoothingMode(2);
    gb.DrawEllipse(5, 3, 10, 10, 1, RGB(190,220,250));
    gb.DrawLine(15, 8, 190, 8, 1, RGB(190,220,250));

    // gb.FillRoundRect(2, 3, 14, 10, 1, 1, RGB(190,220,250));
    // gb.DrawRoundRect(2, 3, 14, 10, 1, 1, 1.0, RGB(150,180,220));
    // gb.FillEllipse(2, 1, 14, 5, RGB(190,220,250));
    // gb.FillEllipse(2, 10, 14, 5, RGB(190,220,250));
    // gb.DrawEllipse(2, 1, 14, 5, 1.0, RGB(150,180,220));
    // gb.DrawEllipse(2, 10, 14, 5, 1.0, RGB(150,180,220));
    // gb.FillEllipse(2, 09, 14, 5, RGB(190,220,250));
    root_img.ReleaseGraphics(gb);

    computer_img = gdi.CreateImage(20, 16);
    gb = computer_img.GetGraphics();
    gb.SetSmoothingMode(2);
    //gb.FillRoundRect(2, 1, 14, 12, 1, 1, RGB(190,220,250));
    gb.DrawRoundRect(2, 1, 14, 12, 1, 1, 1.0, RGB(150,180,220));
    gb.SetSmoothingMode(0);
    gb.FillRoundRect(4, 3, 10, 6, 1, 1, RGB(130,170,200));
    gb.DrawRect(4, 3, 10, 6, 1.0, RGB(120,140,180));
    computer_img.ReleaseGraphics(gb);

    drive_img = gdi.CreateImage(20, 16);
    gb = drive_img.GetGraphics();
    gb.SetSmoothingMode(2);
    //gb.FillGradRect(2, 5, 14, 7, 45, RGB(200,200,200), RGB(150,150,150));
    gb.DrawRoundRect(2, 5, 14, 7, 1, 1, 1.0, RGB(130,130,130));
    gb.SetSmoothingMode(0);
    gb.FillSolidRect(4, 7, 4, 2, RGB(100, 225, 100));
    gb.DrawRect(4, 7, 4, 2, 1.0, RGB(50, 125, 50));
    gb.FillSolidRect(12, 7, 4, 1, RGB(130, 130, 130));
    gb.FillSolidRect(12, 9, 4, 1, RGB(130, 130, 130));
    drive_img.ReleaseGraphics(gb);

    ramdisk_drive_img = gdi.CreateImage(20, 16);
    gb = ramdisk_drive_img.GetGraphics();
    gb.SetSmoothingMode(2);
    gb.FillGradRect(2, 5, 14, 7, 45, RGB(200,200,200), RGB(150,150,150));
    gb.DrawRoundRect(2, 5, 14, 7, 1, 1, 1.0, RGB(130,130,130));
    ramdisk_drive_img.ReleaseGraphics(gb);

    removable_drive_img = gdi.CreateImage(20, 16);
    gb = removable_drive_img.GetGraphics();
    gb.SetSmoothingMode(2);
    gb.FillGradRect(2, 5, 14, 7, 45, RGB(200,200,200), RGB(150,150,150));
    gb.DrawRoundRect(2, 5, 14, 7, 1, 1, 1.0, RGB(130,130,130));
    gb.SetSmoothingMode(0);
    gb.FillSolidRect(7, 6, 1, 6, RGB(200,200,200));
    gb.FillSolidRect(6, 6, 1, 6, RGB(130,130,130));
    removable_drive_img.ReleaseGraphics(gb);

    cdrom_drive_img = gdi.CreateImage(20, 16);
    gb = cdrom_drive_img.GetGraphics();
    gb.SetSmoothingMode(2);
    gb.FillGradRect(2, 5, 14, 7, 45, RGB(200,200,200), RGB(150,150,150));
    gb.DrawRoundRect(2, 5, 14, 7, 1, 1, 1.0, RGB(130,130,130));
    gb.FillEllipse(4, 1, 12, 12, RGBA(0,0,0,120));
    gb.FillEllipse(5, 0, 12, 12, RGB(200,230,250));
    gb.DrawEllipse(5, 0, 12, 12, 1.0, RGB(130,130,130));
    gb.DrawEllipse(8, 3, 6, 6, 1.0, RGB(160,160,160));
    gb.FillEllipse(10, 5, 2, 2, RGB(20,20,20));
    cdrom_drive_img.ReleaseGraphics(gb);

    network_drive_img = gdi.CreateImage(20, 16);
    gb = network_drive_img.GetGraphics();
    gb.SetSmoothingMode(2);
    gb.FillGradRect(2, 5, 14, 7, 45, RGB(200,200,200), RGB(150,150,150));
    gb.DrawRoundRect(2, 5, 14, 7, 1, 1, 1.0, RGB(130,130,130));
    gb.SetSmoothingMode(0);
    gb.FillSolidRect(4, 7, 4, 2, RGB(100, 225, 100));
    gb.DrawRect(4, 7, 4, 2, 1.0, RGB(50, 125, 50));
    gb.FillSolidRect(12, 7, 4, 1, RGB(130, 130, 130));
    gb.FillSolidRect(12, 9, 4, 1, RGB(130, 130, 130));
    gb.SetSmoothingMode(2);
    gb.FillEllipse(4, 2, 10, 8, RGBA(0,0,0,120));
    gb.FillEllipse(5, 0, 8, 8, RGB(190,220,250));
    gb.DrawEllipse(5, 0, 8, 8, 1.0, RGB(130,170,200));
    gb.FillEllipse(4, 3, 4, 4, RGB(170,200,220));
    gb.FillEllipse(8, 2, 4, 4, RGB(240,250,255));
    network_drive_img.ReleaseGraphics(gb);

    playlists_img = gdi.CreateImage(20, 16);
    gb = playlists_img.GetGraphics();
    gb.SetSmoothingMode(0);
    var pl_points = Array(3,5,7,1,14,1,14,14,3,14);
    //gb.FillPolygon(RGB(170,210,240), 0, pl_points);
    gb.DrawPolygon(RGB(140,170,210), 0, pl_points);
    gb.FillSolidRect(6,5,6,1,RGB(240,240,240));
    gb.FillSolidRect(6,8,6,1,RGB(240,240,240));
    gb.FillSolidRect(6,11,6,1,RGB(240,240,240));
    playlists_img.ReleaseGraphics(gb);

    playlist_img = gdi.CreateImage(20, 14);
    gb = playlist_img.GetGraphics();
    gb.SetSmoothingMode(2);
    for (var x = 0; x < 4; x++){
      gb.DrawLine(2, 2+3*x,  4, 2+3*x, 1, RGB(160,190,220))
      gb.DrawLine(6, 2+3*x, 14, 2+3*x, 1, RGB(160,190,220))
    }
    playlist_img.ReleaseGraphics(gb);

    autoplaylist_img = gdi.CreateImage(20, 16);
    gb = autoplaylist_img.GetGraphics();
    gb.SetSmoothingMode(2);
    for (var x = 0; x < 4; x++){
      gb.DrawLine(2, 2+3*x,  4, 2+3*x, 1, RGB(220,190,160))
      gb.DrawLine(6, 2+3*x, 14, 2+3*x, 1, RGB(220,190,160))
    }
    autoplaylist_img.ReleaseGraphics(gb);

    vcursor_img = gdi.CreateImage(vcursor_w, vcursor_h);
    gb = vcursor_img.GetGraphics();
    gb.SetSmoothingMode(2);
    gb.FillRoundRect(3, 2, scrollbar_w-6, 15, 2, 2, RGB(160,190,220));
    gb.DrawRoundRect(3, 2, scrollbar_w-6, 15, 2, 2, 1.0, RGB(120,150,190));
    vcursor_img.ReleaseGraphics(gb);

    //CollectGarbage();
}

function show_context_menu(noeud, x, y) {
    var _menu = window.CreatePopupMenu();
    var idx;
    var i;
    var tmppath = fb.FoobarPath;

    switch(noeud.type) {
        case "root":
            _menu.AppendMenuItem(MF_STRING, 1, "Auto Collapse");
            _menu.CheckMenuItem(1, g_autocollapse);

            _menu.AppendMenuItem(MF_SEPARATOR, 0, "");

            _menu.AppendMenuItem(MF_STRING, 2, "Sort Folders");
            _menu.CheckMenuItem(2, g_sort);

            _menu.AppendMenuItem(MF_STRING, 98, "        in alphabetic order");
            _menu.CheckMenuItem(98, !g_sort_modified);
            _menu.AppendMenuItem(MF_STRING, 99, "        by last-modified date");
            _menu.CheckMenuItem(99, g_sort_modified);

            _menu.AppendMenuItem(MF_SEPARATOR, 0, "");
            _menu.AppendMenuItem(MF_STRING, 3, "Edit file types filter");
            _menu.AppendMenuItem(MF_SEPARATOR, 0, "");
            _menu.AppendMenuItem(MF_STRING, 4, "Show Playlists");
            _menu.AppendMenuItem(MF_STRING, 5, "Show Favorites");
            _menu.AppendMenuItem(MF_STRING, 6, "Show FileSystem");
            _menu.CheckMenuItem(4, g_show_playlists);
            _menu.CheckMenuItem(5, g_show_favorites);
            _menu.CheckMenuItem(6, g_show_filesystem);
            break;
        case "playlists":
            break;
        case "playlist":
            _menu.AppendMenuItem((noeud.path>0)?MF_STRING:MF_GRAYED | MF_DISABLED, 10, "Move Up");
            _menu.AppendMenuItem((noeud.path<plman.PlaylistCount-1)?MF_STRING:MF_GRAYED | MF_DISABLED, 11, "Move Down");
            _menu.AppendMenuItem(MF_SEPARATOR, 0, "");
            _menu.AppendMenuItem(MF_STRING, 12, "Rename this playlist...");
            _menu.AppendMenuItem(MF_STRING, 13, "Delete this playlist");
            _menu.AppendMenuItem(MF_STRING, 14, "Save this playlist...");
            _menu.AppendMenuItem(MF_STRING, 15, "Duplicate this playlist");
            _menu.AppendMenuItem(MF_SEPARATOR, 0, "");
            _menu.AppendMenuItem(MF_STRING, 16, "Insert a new Autoplaylist...");
            if(plman.IsAutoPlaylist(noeud.path)) {
                _menu.AppendMenuItem(MF_STRING, 17, "AutoPlaylist Properties...");
                _menu.AppendMenuItem(MF_STRING, 18, "Convert to a normal Playlist");
            }
            _menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
            _menu.AppendMenuItem(MF_STRING, 19, "Insert a new playlist");
            _menu.AppendMenuItem(MF_STRING, 20, "Load a playlist...");
            break;
        case "favorites":
            break;
        case "favorite":
            if(noeud.enabled) {
                _menu.AppendMenuItem(MF_STRING, 30, "Remove from Favorites");
                _menu.AppendMenuItem(MF_STRING, 31, "Refresh folder content...");
                _menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
                _menu.AppendMenuItem(noeud.item.length>0?MF_STRING:MF_GRAYED | MF_DISABLED, 32, "Add tracks to playlist");
                _menu.AppendMenuItem(noeud.item.length>0?MF_STRING:MF_GRAYED | MF_DISABLED, 33, "Send tracks to playlist and Play");
            } else {
                _menu.AppendMenuItem(MF_STRING, 30, "Dead Link > Remove it from Favorites");
            }
            break;
        case "computer":
            _menu.AppendMenuItem(MF_STRING, 60, "Refresh Computer content...");
            break;
        case "drive":
        case "folder":
            if(noeud.type=="folder" && g_show_favorites)
			_menu.AppendMenuItem(noeud.item.length>0?MF_STRING:MF_GRAYED | MF_DISABLED, 54, "Add found tracks to playlist");
            _menu.AppendMenuItem(noeud.item.length>0?MF_STRING:MF_GRAYED | MF_DISABLED, 55, "Send found tracks to playlist and Play");
			_menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
			_menu.AppendMenuItem(MF_STRING, 50, "Add folder to Favorites");
            _menu.AppendMenuItem(MF_STRING, 51, "Refresh folder content...");
            _menu.AppendMenuItem(MF_STRING, 53, "Open in Windows Explorer...");
            break;
        case "file":
            if(noeud.ftype=="music"||noeud.ftype=="archive") {
                _menu.AppendMenuItem(MF_STRING, 40, "Add to playlist");
                _menu.AppendMenuItem(MF_STRING, 41, "Send to playlist and Play");
                _menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
            }
            _menu.AppendMenuItem(MF_STRING, 42, "Rename file");
            _menu.AppendMenuItem(MF_STRING, 43, "Delete file");
            _menu.AppendMenuItem(MF_STRING, 44, "Open in Windows Explorer...");
            break;
    }

    idx = _menu.TrackPopupMenu(x, y);

    switch(idx) {
    case 1:
        g_autocollapse = !g_autocollapse;
        window.SetProperty("auto collapse", g_autocollapse);
        root.child.splice(0, root.child.length);
        reset = true;
        on_size();
        //CollectGarbage();
        break;
    case 2:
        g_sort = !g_sort;

        window.SetProperty("sort items", g_sort);
        root.child.splice(0, root.child.length);
        reset = true;
        on_size();
        //CollectGarbage();
        break;
    case 3:
        //var newfilter = InputBox("ex: mp3;ogg (empty=no filter)", "Change file types to filter", g_filters_str);
        if (fb.AlwaysOnTop) {
            fb.AlwaysOnTop = false
            var newfilter = utils.InputBox(0,"Enter a list of semicolon (;)-separated file-endings", "Change file types to filter", g_filters_str);
            fb.AlwaysOnTop = true
        } else {
            var newfilter = utils.InputBox(0,"Enter a list of semicolon (;)-separated file-endings", "Change file types to filter", g_filters_str);
        }


        if(typeof(newfilter)=="undefined") {
            newfilter = g_filters_str;
        } else {
            if(!newfilter) {
                g_filters_str = "";
            } else {
                g_filters_str = newfilter;
            }
            window.SetProperty("file type filter", g_filters_str);
            root.child.splice(0, root.child.length);
            reset = true;
            on_size();
            window.Repaint();
            //CollectGarbage();
        }
        break;
    case 4:
        g_show_playlists = !g_show_playlists;
        window.SetProperty("show playlists", g_show_playlists);
        root.child.splice(0, root.child.length);
        reset = true;
        on_size();
        //CollectGarbage();
        break;
    case 5:
        g_show_favorites = !g_show_favorites;
        window.SetProperty("show favorites", g_show_favorites);
        root.child.splice(0, root.child.length);
        reset = true;
        on_size();
        //CollectGarbage();
        break;
    case 6:
        g_show_filesystem = !g_show_filesystem;
        window.SetProperty("show filesystem", g_show_filesystem);
        root.child.splice(0, root.child.length);
        reset = true;
        on_size();
        //CollectGarbage();
        break;
    case 10:
        plman.MovePlaylist(noeud.path, noeud.path-1);
        plman.ActivePlaylist = noeud.path-1;
        if(root.child[0].child.length>0) root.child[0].child.splice(0,root.child[0].child.length);
        FillPlaylists(root.child[0]);
        root.child[0].childchecked = true;
        root.child[0].collapsed = false;
        window.Repaint();
        break;
    case 11:
        plman.MovePlaylist(noeud.path, noeud.path+1);
        plman.ActivePlaylist = noeud.path+1;
        if(root.child[0].child.length>0) root.child[0].child.splice(0,root.child[0].child.length);
        FillPlaylists(root.child[0]);
        root.child[0].childchecked = true;
        root.child[0].collapsed = false;
        window.Repaint();
        break;
    case 12:
        var newname = utils.InputBox(0, "Actual Playlist name: "+noeud.label, "Rename a Playlist", noeud.label);
        if(typeof(newname)=="undefined" || !newname || newname == "") newname = noeud.label;
        if (newname.length > 1 || (newname.length == 1 && (newname >= "a" && newname <= "z") || (newname >= "A" && newname <= "Z") || (newname >= "0" && newname <= "9"))) {
            plman.RenamePlaylist(noeud.path, newname);
            noeud.label = newname;
            window.Repaint();
        }
        break;
    case 13:
        plman.RemovePlaylist(noeud.idx);
        if(root.child[0].child.length>0) root.child[0].child.splice(0,root.child[0].child.length);
        FillPlaylists(root.child[0]);
        root.child[0].childchecked = true;
        root.child[0].collapsed = false;
        window.Repaint();
        break;
    case 14:
        fb.RunMainMenuCommand("File/Save Playlist...");
        break;
    case 15:
        plman.DuplicatePlaylist(noeud.path, "Copy of " + noeud.label);
        plman.ActivePlaylist = noeud.path+1;
        if(root.child[0].child.length>0) root.child[0].child.splice(0,root.child[0].child.length);
        FillPlaylists(root.child[0]);
        root.child[0].childchecked = true;
        root.child[0].collapsed = false;
        window.Repaint();
        break;
    case 16:
        var new_idx = plman.PlaylistCount;
        plman.CreateAutoPlaylist(new_idx, "", "");
        plman.MovePlaylist(new_idx, noeud.path+1);
        plman.ActivePlaylist = noeud.path+1;
        plman.ShowAutoPlaylistUI(noeud.path+1);
        if(root.child[0].child.length>0) root.child[0].child.splice(0,root.child[0].child.length);
        FillPlaylists(root.child[0]);
        root.child[0].childchecked = true;
        root.child[0].collapsed = false;
        window.Repaint();
        break;
    case 17:
        plman.ShowAutoPlaylistUI(noeud.path);
        break;
    case 18:
        plman.DuplicatePlaylist(noeud.path, noeud.label);
        plman.RemovePlaylist(noeud.path);
        plman.ActivePlaylist = noeud.path;
        window.Repaint();
        break;
    case 19:
        var new_idx = plman.PlaylistCount;
        plman.CreatePlaylist(new_idx, "");
        plman.MovePlaylist(new_idx, noeud.path+1);
        plman.ActivePlaylist = noeud.path+1;
        if(root.child[0].child.length>0) root.child[0].child.splice(0,root.child[0].child.length);
        FillPlaylists(root.child[0]);
        root.child[0].childchecked = true;
        root.child[0].collapsed = false;
        window.Repaint();
        break;
    case 20:
        fb.RunMainMenuCommand("File/Load Playlist...");
        break;
    case 30:
        root.child[g_favorites_node_idx].child.splice(noeud.idx, 1);
        g_fav_labels = "";
        g_fav_paths = "";
        for(i=0;i<root.child[g_favorites_node_idx].child.length;i++) {
            root.child[g_favorites_node_idx].child[i].idx = i;
            g_fav_labels = g_fav_labels + (g_fav_labels.length>0?";":"") + root.child[g_favorites_node_idx].child[i].label;
            g_fav_paths = g_fav_paths + (g_fav_paths.length>0?";":"") + root.child[g_favorites_node_idx].child[i].path;
        }
        window.SetProperty("fav total", root.child[1].child.length);
        window.SetProperty("fav paths", g_fav_paths);
        window.SetProperty("fav labels", g_fav_labels);
        window.Repaint();
        break;
    case 31:
        if(noeud.child.length>0) noeud.child.splice(0,noeud.child.length);
        if(noeud.item.length>0) noeud.item.splice(0,noeud.item.length);
        FillTreeLevel(noeud.path, noeud);
        noeud.childchecked = true;
        noeud.collapsed = false;
        window.Repaint();
        break;
    case 32:
        for(i=0;i<noeud.item.length;i++) {
            if(noeud.item[i].ftype=="music" || noeud.item[i].ftype=="archive") {
                WshShell.Run("\"" + tmppath + "foobar2000.exe" + "\"" + " /immediate /add "+"\""+noeud.item[i].path+"\"");
            }
        }
        break;
    case 33:
        var first = true;
        for(i=0;i<noeud.item.length;i++) {
            if(noeud.item[i].ftype=="music" || noeud.item[i].ftype=="archive") {
                if(first) {
                    WshShell.Run("\"" + tmppath + "foobar2000.exe" + "\"" + " /immediate "+"\""+noeud.item[i].path+"\"");
                    first = false;
                } else {
                    WshShell.Run("\"" + tmppath + "foobar2000.exe" + "\"" + " /immediateS /add "+"\""+noeud.item[i].path+"\"");
                }
            }
        }
        break;
    case 40:
        WshShell.Run("\"" + tmppath + "foobar2000.exe" + "\"" + " /immediate /add "+"\""+noeud.path+"\"");
        break;
    case 41:
        WshShell.Run("\"" + tmppath + "foobar2000.exe" + "\"" + " /immediate "+"\""+noeud.path+"\"");
        break;
    case 42:
        var newname = utils.InputBox(0, "Actual filename: "+noeud.label,"Rename a file",  noeud.label);

        if(typeof(newname)=="undefined" || !newname || newname == "") {
            newname = noeud.label;
        } else {
            if (newname.length > 1 || (newname.length == 1 && (newname >= "a" && newname <= "z") || (newname >= "A" && newname <= "Z") || (newname >= "0" && newname <= "9"))) {
                for(i=noeud.path.length;i>=0;i--) {
                    if(noeud.path.charAt(i)=="\\") break;
                }
                try {
                    var newpath= noeud.path.substring(0, i+1) + newname;
                    fso.MoveFile(noeud.path, newpath);
                    noeud.path = newpath;
                    noeud.label = newname;
                    window.Repaint();
                } catch(e) {
                    MsgBox("Check privileges on this folder or Check string entered: "+newname,vb.OKOnly,"Rename Error");
                }
            }
        }
        break;
    case 43:
        fso.DeleteFile(noeud.path);
        var r = "root";
        var tmp;
        for(i=1;i<noeud.pathsum.length;i++) {
            r = r + ".child[" + noeud.pathsum[i] + "]";
        }
        r = r + ".item";
        eval(r).splice(noeud.idx, 1);
        for(i=0;i<eval(r).length;i++) {
            tmp = r+"["+i+"]";
            eval(tmp).idx = i;
        }
        window.Repaint();
        break;
    case 44:
        var r = "root";
        var tmp;
        for(i=1;i<noeud.pathsum.length;i++) {
            r = r + ".child[" + noeud.pathsum[i] + "]";
        }
        var r = r + ".path";
        WshShell.Run("%windir%\\explorer "+eval(r));
        break;
    case 50:
        root.child[g_favorites_node_idx].addchild(noeud.label, noeud.path, noeud.modified_date);
        root.child[g_favorites_node_idx].child[root.child[g_favorites_node_idx].child.length-1].type = "favorite";
        root.child[g_favorites_node_idx].collapsed = false;
        g_fav_labels = "";
        g_fav_paths = "";
        for(i=0;i<root.child[g_favorites_node_idx].child.length;i++) {
            g_fav_labels = g_fav_labels + (g_fav_labels.length>0?";":"") + root.child[g_favorites_node_idx].child[i].label;
            g_fav_paths = g_fav_paths + (g_fav_paths.length>0?";":"") + root.child[g_favorites_node_idx].child[i].path;
        }
        window.SetProperty("fav total", root.child[g_favorites_node_idx].child.length);
        window.SetProperty("fav paths", g_fav_paths);
        window.SetProperty("fav labels", g_fav_labels);
        window.Repaint();
        break;
    case 51:
        if(noeud.child.length>0) noeud.child.splice(0,noeud.child.length);
        if(noeud.item.length>0) noeud.item.splice(0,noeud.item.length);
        FillTreeLevel(noeud.path, noeud);
        noeud.childchecked = true;
        noeud.collapsed = false;
        window.Repaint();
        break;
    case 53:
        WshShell.Run("%windir%\\explorer "+noeud.path);
        break;
    case 54:
        for(i=0;i<noeud.item.length;i++) {
            if(noeud.item[i].ftype=="music" || noeud.item[i].ftype=="archive") {
                WshShell.Run("\"" + tmppath + "foobar2000.exe" + "\"" + " /immediate /add "+"\""+noeud.item[i].path+"\"");
            }
        }
        break;
    case 55:
        var first = true;
        for(i=0;i<noeud.item.length;i++) {
            if(noeud.item[i].ftype=="music" || noeud.item[i].ftype=="archive") {
                if(first) {
                    WshShell.Run("\"" + tmppath + "foobar2000.exe" + "\"" + " /immediate "+"\""+noeud.item[i].path+"\"");
                    first = false;
                } else {
                    WshShell.Run("\"" + tmppath + "foobar2000.exe" + "\"" + " /immediate /add "+"\""+noeud.item[i].path+"\"");
                }
            }
        }
        break;
    case 60:
        if(noeud.child.length>0) noeud.child.splice(0,noeud.child.length);
        if(noeud.item.length>0) noeud.item.splice(0,noeud.item.length);
        drive_counter = 0;
        FillDrives(root.child[g_filesystem_node_idx]);
        root.child[g_filesystem_node_idx].childchecked = false;
        refresh_drives();
        window.Repaint();
        break;
    case 98:
      g_sort_modified = false
      window.SetProperty("sort by modified date", g_sort_modified);
      root.child.splice(0, root.child.length);
      reset = true;
      on_size();
      //CollectGarbage();
      break;

    case 99:
      g_sort_modified = true
      window.SetProperty("sort by modified date", g_sort_modified);
      root.child.splice(0, root.child.length);
      reset = true;
      on_size();
      //CollectGarbage();
      break;
    }
    //_menu.Dispose();
    return true;
}

function on_mouse_rbtn_up(x, y) {
    //return true;
}
