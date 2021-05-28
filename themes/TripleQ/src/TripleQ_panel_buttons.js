//include('samples/Library Tree/Library Tree 2.1.3.js');

include(fb.ProfilePath + '\\themes\\TripleQ\\src\\TripleQ_common.js');
include(fb.ProfilePath + '\\themes\\TripleQ\\src\\TripleQ_statevars.js');

window.DefinePanel('buttonpanel', {author:'RQ'});
include(fb.ComponentPath + 'docs\\Helpers.js');
include(fb.ComponentPath + 'samples\\complete\\js\\lodash.min.js');
include(fb.ComponentPath + 'samples\\complete\\js\\helpers.js');
include(fb.ComponentPath + 'samples\\complete\\js\\volume.js');
include(fb.ComponentPath + 'samples\\complete\\js\\panel.js');


var panel = new _panel(true);
var left_buttons = new _buttons();
var right_buttons = new _buttons();
var queue_buttons = new _buttons();

var img_queuebutton = 'queuebutton.png'
var img_queuebutton_sel = 'queuebutton_sel.png'

// size of the small buttons
var button_small = window.Height * .7
var button_big = window.Height*.9
var button_big_surround = window.Height
var utility_button = window.Height * .5
var utility_button_surround = window.Height * .7
var minibutton = window.Height * .5

var usewidth = window.Width - button_big


var max_rightpanel_window_width = 800


// button to set the playback-order
var playbackorder_y = 20

var playbackorder_string = {0:'Default',
							1:'Repeat (Playlist)',
							2:'Repeat (Track)',
							3:'Random',
							4:'Shuffle (tracks)',
							5:'Shuffle (albums)',
							6:'Shuffle (folders)'};


var playback_buttons = new _buttons();
var menubuttons = new _buttons();

// initialize playback-order as linear
plman.PlaybackOrder == 0



// buttons for right side panels
queue_buttons.buttons.queue0001 = new _button(usewidth - 6 * button_big_surround, (button_big - button_small) / 2, button_small, button_small,
  {normal : img_folder + img_queuebutton,
		hover : img_folder + img_queuebutton_sel}, (x, y, mask) => {togglepanel_left(showpanel_left_state, 1, 'queue', queue_buttons);}, 'Queue');

right_buttons.buttons.rightb0001 = new _button(usewidth - 4 * button_big_surround, 0, button_big, button_big,
	{normal : img_folder + 'library.png',
	  hover : img_folder + 'library_sel.png'}, (x, y, mask) => {togglepanel(showpanel_right_state, 1, 'rightb', right_buttons);}, 'Library');
right_buttons.buttons.rightb0002 = new _button(usewidth - 3 * button_big_surround, 0, button_big, button_big,
	{normal : img_folder + 'treeview.png',
	  hover : img_folder + 'treeview_sel.png'}, (x, y, mask) => {togglepanel(showpanel_right_state, 2, 'rightb', right_buttons);}, 'Tree View');
right_buttons.buttons.rightb0003 = new _button(usewidth - 2 * button_big_surround, 0, button_big, button_big,
	{normal : img_folder + 'coverflow.png',
	  hover : img_folder + 'coverflow_sel.png'}, (x, y, mask) => {togglepanel(showpanel_right_state, 3, 'rightb', right_buttons);}, 'Coverflow');
right_buttons.buttons.rightb0004 = new _button(usewidth - 1 * button_big_surround, 0, button_big, button_big,
	{normal : img_folder + 'filesystem.png',
		hover : img_folder + 'filesystem_sel.png'}, (x, y, mask) => {togglepanel(showpanel_right_state, 4, 'rightb', right_buttons);}, 'File Browser');

menubuttons.buttons.menu = new _button(usewidth, 0, minibutton, minibutton,
	{normal : img_folder + 'menu.png',
	 hover : img_folder + 'menu_sel.png'}, (x, y, mask) => { _menu(x, 20); }, 'Menu');
playback_buttons.buttons.playbackorder = new _button(usewidth, minibutton, minibutton, minibutton,
	{normal : img_folder + 'playback_linear.png'}, (x, y, mask) => {set_playback_state();}, playbackorder_string[plman.PlaybackOrder]);

left_buttons.buttons.leftb1 = new _button(5,                               0, utility_button, utility_button,
	{normal : img_folder + 'move_to_sorted_music.png',
	 hover : img_folder + 'move_to_sorted_music_sel.png'},   (x, y, mask) => {fb.RunContextCommandWithMetadb('File Operations/Move to/move_to_sorted_music', fb.GetSelections(1));}, 'Move to sorted music');
left_buttons.buttons.leftb2 = new _button(5 + 1 * utility_button_surround, 0, utility_button, utility_button,
	{normal : img_folder + 'move_to_unsorted_music.png',
	 hover : img_folder + 'move_to_unsorted_music_sel.png'}, (x, y, mask) => {fb.RunContextCommandWithMetadb('File Operations/Move to/move_to_unsorted_music', fb.GetSelections(1) );}, 'Move to unsorted music');
left_buttons.buttons.leftb3 = new _button(5 + 2 * utility_button_surround, 0, utility_button, utility_button,
	{normal : img_folder + 'replaygain_tracks.png',
	 hover : img_folder + 'replaygain_tracks_sel.png'
 },      (x, y, mask) => {fb.RunContextCommandWithMetadb('ReplayGain/Scan as albums (by tags)', fb.GetSelections(1) );}, 'ReplayGain/Scan as albums (by tags)');
left_buttons.buttons.leftb4 = new _button(5 + 3 * utility_button_surround, 0, utility_button, utility_button,
	{normal : img_folder + 'open_containing_folder.png',
	 hover : img_folder + 'open_containing_folder_sel.png'}, (x, y, mask) => {fb.RunContextCommandWithMetadb('Open containing folder', fb.GetSelections(1) );}, 'Open containing folder');
left_buttons.buttons.leftb5 = new _button(5 + 4 * utility_button_surround, 0, utility_button, utility_button,
	{normal : img_folder + 'playback_device.png',
	 hover : img_folder + 'playback_device_sel.png'},        (x, y, mask) => { _output_devices(x, y); }, _get_active_output_device());


var save_left_buttons = left_buttons.buttons



update_right_panel_image()
update_playback_button()
update_output_device_button()


// a function to set the playback state
function set_playback_state() {
	if (plman.PlaybackOrder == 0) {
		plman.PlaybackOrder = 1
	} else if (plman.PlaybackOrder == 1) {
		plman.PlaybackOrder = 2
	} else if (plman.PlaybackOrder == 2) {
		plman.PlaybackOrder = 3
	} else if (plman.PlaybackOrder == 3) {
		plman.PlaybackOrder = 4
	} else if (plman.PlaybackOrder == 4) {
		plman.PlaybackOrder = 5
	} else if (plman.PlaybackOrder == 5) {
		plman.PlaybackOrder = 6
	} else if (plman.PlaybackOrder == 6) {
		plman.PlaybackOrder = 0
	}
}


// a function to update the playback-state buttons
function update_playback_button() {
	if (plman.PlaybackOrder == 1) {
		playback_buttons.buttons.playbackorder.img_normal = _img(img_folder + 'playback_repeat_playlist.png')
		playback_buttons.buttons.playbackorder.img_hover = _img(img_folder + 'playback_repeat_playlist.png')
	} else if (plman.PlaybackOrder == 2) {
		playback_buttons.buttons.playbackorder.img_normal = _img(img_folder + 'playback_repeat_track.png')
		playback_buttons.buttons.playbackorder.img_hover = _img(img_folder + 'playback_repeat_track.png')
	} else if (plman.PlaybackOrder == 3) {
		playback_buttons.buttons.playbackorder.img_normal = _img(img_folder + 'playback_random.png')
		playback_buttons.buttons.playbackorder.img_hover = _img(img_folder + 'playback_random.png')
	} else if (plman.PlaybackOrder == 4) {
		playback_buttons.buttons.playbackorder.img_normal = _img(img_folder + 'playback_shuffle_tracks.png')
		playback_buttons.buttons.playbackorder.img_hover = _img(img_folder + 'playback_shuffle_tracks.png')
	} else if (plman.PlaybackOrder == 5) {
		playback_buttons.buttons.playbackorder.img_normal = _img(img_folder + 'playback_shuffle_albums.png')
		playback_buttons.buttons.playbackorder.img_hover = _img(img_folder + 'playback_shuffle_albums.png')
	} else if (plman.PlaybackOrder == 6) {
		playback_buttons.buttons.playbackorder.img_normal = _img(img_folder + 'playback_shuffle_folders.png')
		playback_buttons.buttons.playbackorder.img_hover = _img(img_folder + 'playback_shuffle_folders.png')
	} else if (plman.PlaybackOrder == 0) {
		playback_buttons.buttons.playbackorder.img_normal = _img(img_folder + 'playback_linear.png')
		playback_buttons.buttons.playbackorder.img_hover = _img(img_folder + 'playback_linear.png')
	}
	playback_buttons.buttons.playbackorder.tiptext = playbackorder_string[plman.PlaybackOrder]
	//playback_buttons.buttons.playbackorder.cs('normal')
	playback_buttons.buttons.playbackorder.cs('hover')
}


function update_queue_button() {

	// check if the playback-queue changed, and if yes, re-draw the Queuebutton
	let handles = plman.GetPlaybackQueueHandles();
	let queue_cnt_string = handles.Count.toString()

	if (handles.Count >= 7) {
		img_queuebutton = 'queuebutton_full.png'
	    img_queuebutton_sel = 'queuebutton_full_sel.png'
	} else if (handles.Count == 0) {
		img_queuebutton = 'queuebutton.png'
	    img_queuebutton_sel = 'queuebutton_sel.png'

	} else {
		img_queuebutton = 'queuebutton_' + queue_cnt_string + '.png'
		img_queuebutton_sel = 'queuebutton_' + queue_cnt_string + '_sel.png'
	}

	if (handles.Count == 1) {
	queue_cnt_string = queue_cnt_string + ' song queued'
	} else {
	queue_cnt_string = queue_cnt_string + ' songs queued'
	}

	// update queue button image
	if (showpanel_left_state.getValue() == '0001') {
		queue_buttons.buttons.queue0001.img_normal = _img(img_folder + img_queuebutton_sel)
		queue_buttons.buttons.queue0001.img_hover = _img(img_folder + img_queuebutton_sel)
		queue_buttons.buttons.queue0001.cs('normal')
	} else {
		queue_buttons.buttons.queue0001.img_normal = _img(img_folder + img_queuebutton)
		queue_buttons.buttons.queue0001.img_hover = _img(img_folder + img_queuebutton_sel)
		queue_buttons.buttons.queue0001.cs('normal')
		}

}




function togglepanel_left(showpanel, n, prefix, buttons) {
	if (showpanel.getValue() == n) {
		showpanel.setValue('0000', true);
		var btn;
		for (btn in buttons.buttons) {
			buttons.buttons[btn].w = button_small
			buttons.buttons[btn].h = button_small
			buttons.buttons[btn].y = (button_big - button_small)/2
		}

	} else {
		showpanel.setValue(padToFour(n), true);
		var btn;
		for (btn in buttons.buttons) {
			buttons.buttons[btn].w = button_big
			buttons.buttons[btn].h = button_big
			buttons.buttons[btn].y = 0
		}
	}


	if (showpanel_left_state.getValue() == '0001') {
		queue_buttons.buttons.queue0001.img_normal = _img(img_folder + img_queuebutton_sel)
		queue_buttons.buttons.queue0001.img_hover = _img(img_folder + img_queuebutton_sel)
		queue_buttons.buttons.queue0001.cs('normal')
	} else {
		queue_buttons.buttons.queue0001.img_normal = _img(img_folder + img_queuebutton)
		queue_buttons.buttons.queue0001.img_hover = _img(img_folder + img_queuebutton_sel)
		queue_buttons.buttons.queue0001.cs('normal')
		}

	window.Repaint()
}


function update_right_panel_image() {
	// change button images to have a different image when panel is active
	if (showpanel_right_state.getValue() == '0001') {
		right_buttons.buttons.rightb0001.img_normal = _img(img_folder + 'library_sel.png')
		right_buttons.buttons.rightb0001.cs('normal')
	} else {
		right_buttons.buttons.rightb0001.img_normal = _img(img_folder + 'library.png')
		right_buttons.buttons.rightb0001.cs('normal')
		}
	if (showpanel_right_state.getValue() == '0002') {
		right_buttons.buttons.rightb0002.img_normal = _img(img_folder + 'treeview_sel.png')
		right_buttons.buttons.rightb0002.cs('normal')
	} else {
		right_buttons.buttons.rightb0002.img_normal = _img(img_folder + 'treeview.png')
		right_buttons.buttons.rightb0002.cs('normal')
		}
	if (showpanel_right_state.getValue() == '0003') {
		right_buttons.buttons.rightb0003.img_normal = _img(img_folder + 'coverflow_sel.png')
		right_buttons.buttons.rightb0003.cs('normal')
	} else {
		right_buttons.buttons.rightb0003.img_normal = _img(img_folder + 'coverflow.png')
		right_buttons.buttons.rightb0003.cs('normal')
		}
	if (showpanel_right_state.getValue() == '0004') {
		right_buttons.buttons.rightb0004.img_normal = _img(img_folder + 'filesystem_sel.png')
		right_buttons.buttons.rightb0004.cs('normal')
	} else {
		right_buttons.buttons.rightb0004.img_normal = _img(img_folder + 'filesystem.png')
		right_buttons.buttons.rightb0004.cs('normal')
		}
}

function update_output_device_button() {
	let current_output_device = _get_active_output_device()
	if (current_output_device == "Null Output" || current_output_device == "Output Device") {
		left_buttons.buttons.leftb5.img_normal = _img(img_folder + 'playback_device_no_output.png');
		} else {
		left_buttons.buttons.leftb5.img_normal = _img(img_folder + 'playback_device.png');
		}
		left_buttons.buttons.leftb5.cs('normal');
}


function update_replaygain_button() {
	// update replaygain image to indicate if playing track (or selection) is missing replaygain info
	let handle_list = fb.GetQueryItems(fb.GetSelections(), "%replaygain_album_gain% MISSING OR %replaygain_track_gain% MISSING");

	if (handle_list.Count > 0) {
		left_buttons.buttons.leftb3.img_normal = _img(img_folder + 'replaygain_tracks_noinfo.png');
	} else {
		left_buttons.buttons.leftb3.img_normal = _img(img_folder + 'replaygain_tracks.png');
	}
	left_buttons.buttons.leftb3.cs('normal');
}


function togglepanel(showpanel, n, prefix, buttons) {
	if (showpanel.getValue() == 0 && n > 0) {
		if (window.Width > max_rightpanel_window_width) {
			set_mainpanel_width(max_rightpanel_window_width * 2)
		} else {
			set_mainpanel_width(window.Width * 2)
		}
	}

	if (showpanel.getValue() == n) {
		set_mainpanel_width(window.Width / 2)
		showpanel.setValue('0000', true);
		} else {
		showpanel.setValue(padToFour(n), true);
	}

	update_right_panel_image()
	window.Repaint()
}


function on_playback_order_changed(new_order_index) {
	update_playback_button()
	window.Repaint()
}


function on_playback_queue_changed(origin) {
	update_queue_button()
	window.Repaint()
}

function on_colours_changed() {
	panel.colours_changed();
	window.Repaint();
}

function on_mouse_lbtn_up(x, y, mask) {
	left_buttons.lbtn_up(x, y, mask);
	right_buttons.lbtn_up(x, y, mask);
	queue_buttons.lbtn_up(x, y, mask);
	playback_buttons.lbtn_up(x, y, mask);
	menubuttons.lbtn_up(x, y, mask);
	window.Repaint()
	//console.log(showpanel_left_state.getValue())
	//console.log(showpanel_right_state.getFileValue())

}

function on_mouse_leave() {
	left_buttons.leave();
	right_buttons.leave();
	queue_buttons.leave();
	playback_buttons.leave();
	menubuttons.leave();
}

function on_mouse_move(x, y) {
	left_buttons.move(x, y);
	right_buttons.move(x, y);
	queue_buttons.move(x, y);
	playback_buttons.move(x, y);
	menubuttons.move(x, y);
}

function on_mouse_rbtn_up(x, y) {
	if (menubuttons.buttons.menu.trace(x, y)) {
		_help(menubuttons.buttons.menu.x, menubuttons.buttons.menu.h);
		return true;
	} else {
		return panel.rbtn_up(x, y);
	}
}




function on_paint(gr) {
	gr.FillSolidRect(0, 0, window.Width, window.Height, RGB(37, 37, 37));

	// size of the small buttons
	var button_small = window.Height * .7
	var button_big = window.Height*.9
	var button_big_surround = window.Height
	var utility_button = window.Height * .5
	var utility_button_surround = window.Height * .7
	var minibutton = window.Height * .5

	// resize and reposition buttons
	if (showpanel_right_state.getValue() == 0) {
		usewidth = window.Width - button_big
	} else {
		usewidth = window.Width / 2 - button_big
	}


	// update size and position of right buttons
	var btn;
	for (btn in right_buttons.buttons) {
		var btn_id = Number(btn.slice(-4))

		if (btn == 'rightb' + showpanel_right_state.getValue().toString()){
			right_buttons.buttons[btn].w = button_small
			right_buttons.buttons[btn].h = button_small
			right_buttons.buttons[btn].y = (button_big - button_small)/2 //0
			right_buttons.buttons[btn].x = usewidth - btn_id * button_big_surround
		} else {
			right_buttons.buttons[btn].w = button_small
			right_buttons.buttons[btn].h = button_small
			right_buttons.buttons[btn].y = (button_big - button_small)/2
			right_buttons.buttons[btn].x = usewidth - btn_id * button_big_surround
		}
	}

	// update size and position of queue-button
	btn_id  = btn_id + 1
	var btn;
	for (btn in queue_buttons.buttons) {
		btn_id  = btn_id + 1
		if (btn == 'leftb' + showpanel_right_state.getValue().toString()){
			queue_buttons.buttons[btn].w = button_big
			queue_buttons.buttons[btn].h = button_big
			queue_buttons.buttons[btn].y = 0
			queue_buttons.buttons[btn].x = usewidth - btn_id * button_big_surround
		} else {
			queue_buttons.buttons[btn].w = button_small
			queue_buttons.buttons[btn].h = button_small
			queue_buttons.buttons[btn].y = (button_big - button_small)/2
			queue_buttons.buttons[btn].x = usewidth - btn_id * button_big_surround
		}
	}

	// update size and position of playback-order and menu-button

	playback_buttons.buttons.playbackorder.x = usewidth
	playback_buttons.buttons.playbackorder.y = minibutton
	playback_buttons.buttons.playbackorder.w = minibutton
	playback_buttons.buttons.playbackorder.h = minibutton

	menubuttons.buttons.menu.x = usewidth
	menubuttons.buttons.menu.y = 0
	menubuttons.buttons.menu.w = minibutton
	menubuttons.buttons.menu.h = minibutton


	// update size and position of left buttons
	var btn;
	var i = 0
	for (btn in left_buttons.buttons) {
		left_buttons.buttons[btn].w = utility_button
		left_buttons.buttons[btn].h = utility_button
		left_buttons.buttons[btn].y = 2
		left_buttons.buttons[btn].x = 5 + i * utility_button_surround
		i = i + 1

		if (btn == 'leftb5') {
			// update position of popup menu
			left_buttons.buttons[btn].fn = function(x, y, mask) { _output_devices(x,window.Height/6*16) };
			left_buttons.buttons[btn].tiptext = _get_active_output_device()
		}
	}

	panel.paint(gr);
	right_buttons.paint(gr);
	queue_buttons.paint(gr);
	playback_buttons.paint(gr);
	menubuttons.paint(gr);

	// show-hide utilities buttons if there's enough space to show them
	if (usewidth > button_big_surround * 6.1 + utility_button_surround * 5){
		left_buttons.buttons = save_left_buttons
		left_buttons.paint(gr);
	} else {
		left_buttons.buttons = {}

	}

	var font = gdi.Font("Segoe UI", 12, 0);
	//gr.GdiDrawText(window.Width, font, RGB(255,255,255), 5, 1, 226, 1000);

}


function on_focus(is_focused) {
	if (is_focused) {
		plman.SetActivePlaylistContext();
	}
}

function on_selection_changed () {
	update_replaygain_button()
	update_output_device_button()
};

function on_metadb_changed(handle_list, fromhook) {
	update_replaygain_button()
}

function on_output_device_changed() {
	update_output_device_button()
}
