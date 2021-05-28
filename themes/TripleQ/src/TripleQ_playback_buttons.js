window.DefinePanel('Playback Buttons', {author:'RQ'});
include(fb.ProfilePath + 'themes\\TripleQ\\src\\TripleQ_common.js');

include(fb.ComponentPath + 'docs\\Helpers.js');
include(fb.ComponentPath + 'samples\\complete\\js\\lodash.min.js');
include(fb.ComponentPath + 'samples\\complete\\js\\helpers.js');


var playback_buttons = new _buttons();
var painted = false

var buttonsize = 40
var usewidth = 120

var space = (usewidth - buttonsize * 4)/4
var buttonsize_space = buttonsize + space;

playback_buttons.buttons.previous 	   = new _button(space,                        (window.Height - buttonsize)/2, buttonsize, buttonsize, {normal : img_folder + 'playback\\previous.png'}, (x, y, mask) => {fb.Prev()}, '');
playback_buttons.buttons.playpause 	   = new _button(space + 1 * buttonsize_space, (window.Height - buttonsize)/2, buttonsize, buttonsize, {normal : img_folder + 'playback\\pause.png', hover : img_folder + 'play.png'}, (x, y, mask) => {fb.PlayOrPause()}, '');
playback_buttons.buttons.stop 	 	   = new _button(space + 2 * buttonsize_space, (window.Height - buttonsize)/2, buttonsize, buttonsize, {normal : img_folder + 'playback\\stop.png'}, (x, y, mask) => {fb.Stop()}, '');
playback_buttons.buttons.next 	 	   = new _button(space + 3 * buttonsize_space, (window.Height - buttonsize)/2, buttonsize, buttonsize, {normal : img_folder + 'playback\\next.png'}, (x, y, mask) => {fb.Next()}, '');

if (fb.IsPaused) {
	playback_buttons.buttons.playpause = new _button(space + 1 * buttonsize_space, (window.Height - buttonsize)/2, buttonsize, buttonsize, {normal : img_folder + 'playback\\pause.png', hover : img_folder + 'playback\\play.png'}, (x, y, mask) => {fb.PlayOrPause()}, '');
} else {
	playback_buttons.buttons.playpause = new _button(space + 1 * buttonsize_space, (window.Height - buttonsize)/2, buttonsize, buttonsize, {normal : img_folder + 'playback\\play.png', hover : img_folder + 'playback\\pause.png'}, (x, y, mask) => {fb.PlayOrPause()}, '');
}


function update_buttons() {
	// update play/pause image based on playback state
	if (fb.IsPaused) {
		playback_buttons.buttons.playpause.img_normal = _img(img_folder + 'playback\\pause.png')
		playback_buttons.buttons.playpause.img_hover = _img(img_folder + 'playback\\play.png')
	} else {
		playback_buttons.buttons.playpause.img_normal = _img(img_folder + 'playback\\play.png')
		playback_buttons.buttons.playpause.img_hover = _img(img_folder + 'playback\\pause.png')
	}
}




function on_paint(gr) {
    gr.FillSolidRect(0, 0, window.Width, window.Height, RGB(37, 37, 37));

	var buttonsize = 40
	var usewidth = 120

	var space = (usewidth - buttonsize * 4)/4
	var buttonsize_space = buttonsize + space;


	if (window.Width > usewidth) {
		usewidth = 120
	} else {
		usewidth = window.Width
	}

	while ((buttonsize * 4.4) < usewidth || buttonsize < window.Height) {
		buttonsize = buttonsize + .1
	}
	while ((buttonsize * 4.4) > usewidth || buttonsize > window.Height) {
		buttonsize = buttonsize - .1
	}

	space = (usewidth - buttonsize * 4)/4
	buttonsize_space = buttonsize + space;


	var btn;
	var i = 0
	for (btn in playback_buttons.buttons) {
		playback_buttons.buttons[btn].w = buttonsize
		playback_buttons.buttons[btn].h = buttonsize
		playback_buttons.buttons[btn].y = (window.Height - buttonsize)/2
		playback_buttons.buttons[btn].x = space + i * buttonsize_space
		i = i + 1
	}

	// update playback button image
	update_buttons()

	playback_buttons.paint(gr);
}

function on_playback_pause(state) {
	update_buttons()
  playback_buttons.buttons.playpause.cs('normal')
}

function on_playback_starting(state) {
	update_buttons()
  playback_buttons.buttons.playpause.cs('normal')
}


function on_mouse_lbtn_up(x, y, mask) {
	playback_buttons.lbtn_up(x, y, mask);
}

function on_mouse_leave() {
	playback_buttons.leave();
}

function on_mouse_move(x, y) {
	playback_buttons.move(x, y);
}

function on_size(width, height) {
}


function on_focus(is_focused) {
	window.Repaint()
}
