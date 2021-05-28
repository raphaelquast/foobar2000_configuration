include(fb.ProfilePath + '\\themes\\TripleQ\\src\\TripleQ_common.js');
include(fb.ProfilePath + '\\themes\\TripleQ\\src\\TripleQ_statevars.js');

window.DefinePanel('TripleQ_resize_buttons', {author:'asdf'});
include(fb.ComponentPath + 'docs\\Helpers.js');
include(fb.ComponentPath + 'samples\\complete\\js\\lodash.min.js');
include(fb.ComponentPath + 'samples\\complete\\js\\helpers.js');

var close_button_size = 12
var close_button_size_midi = 9

var resize_button_size = 15
var resize_button_size_surround = 20


var midi_height = 20
var mini_height = 20
var mini_width = 100

var resize_buttons = new _buttons();

resize_buttons.buttons.b0001 = new _button(window.Width - resize_button_size_surround ,
	resize_button_size_surround - resize_button_size, resize_button_size, resize_button_size,
	{normal : img_folder + 'Resizebutton.png',
	 hover : img_folder + 'Midimode.png'}, (x, y, mask) => {resizeit(1);}, '');

resize_buttons.buttons.b0002 = new _button(window.Width - resize_button_size_surround * 2,
	resize_button_size_surround - resize_button_size, resize_button_size, resize_button_size,
	{normal : img_folder + 'Resizebutton.png',
	 hover : img_folder + 'Minimode.png'}, (x, y, mask) => {resizeit(2);}, '');


resize_buttons.buttons.b0003 = new _button(
	window.Width - close_button_size,
	0,
	close_button_size, close_button_size,
	 	{normal : img_folder + 'Close.png',
	 	 hover : img_folder + 'Close_sel.png'}, (x, y, mask) => {close_foobar();}, '');


function close_foobar() {
	fb.RunMainMenuCommand("File/Exit");
}


function resizeit(n) {
	if (view_state.getValue() == 0) {
		windowwidth_state.setValue(padToFour(window.Width), true)
		windowheight_state.setValue(padToFour(window.Height), true)
		window.Repaint()
	}

	if (view_state.getValue() == n) {
		view_state.setValue(0, true)

		g_uihacks.setMaxWidth(windowwidth_state.getValue())
		g_uihacks.setMinWidth(windowwidth_state.getValue())
		g_uihacks.setMaxHeight(windowheight_state.getValue())
		g_uihacks.setMinHeight(windowheight_state.getValue())

		set_mainpanel_width(windowwidth_state.getValue())
		set_mainpanel_height(windowheight_state.getValue())
		g_uihacks.EnableSizing(true)
		window.Repaint()

	} else if (n == 1) {
		view_state.setValue(n, true)
		set_mainpanel_height(midi_height)
		set_mainpanel_width(windowwidth_state.getValue())

		g_uihacks.setMaxWidth(9999)
		g_uihacks.setMinWidth(0)
		g_uihacks.setMaxHeight(midi_height)
		g_uihacks.setMinHeight(midi_height)

		g_uihacks.enableMinSize()
		g_uihacks.enableMaxSize()
		g_uihacks.EnableSizing(true)
		window.Repaint()

	} else if (n == 2) {
		view_state.setValue(n, true)
		set_mainpanel_height(mini_height)
		set_mainpanel_width(mini_width)

		g_uihacks.DisableSizing(true)
		window.Repaint()

	}
	//console.log(view_state.getValue())
	//console.log(showpanel_left_state.getValue())
	//console.log(showpanel_right_state.getValue())
}



function on_paint(gr) {
	gr.FillSolidRect(0, 0, window.Width, window.Height, RGB(37, 37, 37));
	resize_buttons.paint(gr);
}


function on_size(width, height) {
	//g_uihacks.setMaxWidth(window.Width)
	//g_uihacks.setMinWidth(window.Width)
	//g_uihacks.setMaxHeight(window.Height)
	//g_uihacks.setMinHeight(window.Height)


	if (view_state.getValue() == 0) {
		// MAXI
		resize_buttons.buttons.b0001.x = window.Width - resize_button_size_surround * 1
		resize_buttons.buttons.b0001.y = resize_button_size
		resize_buttons.buttons.b0001.w = resize_button_size
		resize_buttons.buttons.b0001.h = resize_button_size
		resize_buttons.buttons.b0001.img_normal = _img(img_folder + 'Resizebutton.png')
		resize_buttons.buttons.b0001.img_hover = _img(img_folder + 'Midimode_sel.png')
		//resize_buttons.buttons.b0001.tiptext = 'MIDI'

		resize_buttons.buttons.b0002.x = window.Width - resize_button_size_surround * 2
		resize_buttons.buttons.b0002.y = resize_button_size
		resize_buttons.buttons.b0002.w = resize_button_size
		resize_buttons.buttons.b0002.h = resize_button_size
		resize_buttons.buttons.b0002.img_hover = _img(img_folder + 'Minimode_sel.png')
		//resize_buttons.buttons.b0002.tiptext = 'MINI'

		resize_buttons.buttons.b0003.x = window.Width - close_button_size
		resize_buttons.buttons.b0003.y = 0
		resize_buttons.buttons.b0003.w = close_button_size
		resize_buttons.buttons.b0003.h = close_button_size

		g_uihacks.SetPseudoCaption(window.Width * 0.2, 0, window.Width * 0.8 - resize_button_size_surround * 2, window.Height * 0.08)

		windowwidth_state.setValue(padToFour(window.Width), true)
		windowheight_state.setValue(padToFour(window.Height), true)

		g_uihacks.setMinHeight(window.Height)
		g_uihacks.setMaxHeight(window.Height)
		g_uihacks.setMinWidth(window.Width)
		g_uihacks.setMaxWidth(window.Width)



	} else if (view_state.getValue() == 1) {
		// MIDI
		resize_buttons.buttons.b0001.x = window.Width - resize_button_size_surround
		resize_buttons.buttons.b0001.y = window.Height/2 - resize_button_size_surround / 2
		resize_buttons.buttons.b0001.w = resize_button_size
		resize_buttons.buttons.b0001.h = resize_button_size
		resize_buttons.buttons.b0001.img_hover = _img(img_folder + 'Maximode_sel.png')
		//resize_buttons.buttons.b0001.tiptext = 'MAXI'

		resize_buttons.buttons.b0002.x = window.Width - resize_button_size_surround * 2
		resize_buttons.buttons.b0002.y = window.Height/2 - resize_button_size_surround / 2
		resize_buttons.buttons.b0002.w = resize_button_size
		resize_buttons.buttons.b0002.h = resize_button_size
		resize_buttons.buttons.b0002.img_hover = _img(img_folder + 'Minimode_sel.png')
		//resize_buttons.buttons.b0002.tiptext = 'MINI'

		resize_buttons.buttons.b0003.x = window.Width - close_button_size_midi
		resize_buttons.buttons.b0003.y = 0
		resize_buttons.buttons.b0003.w = close_button_size_midi
		resize_buttons.buttons.b0003.h = close_button_size_midi


		windowwidth_state.setValue(padToFour(window.Width), true)

		//g_uihacks.DisableSizing(true)
		g_uihacks.SetPseudoCaption(window.Width * 0.1, 0, window.Width * 0.35, window.Height)

	} else if (view_state.getValue() == 2) {
		// MINI
		resize_buttons.buttons.b0001.x = window.Width - window.Height / 2
		resize_buttons.buttons.b0001.y = 0
		resize_buttons.buttons.b0001.w = (window.Height / 2) * .9
		resize_buttons.buttons.b0001.h = (window.Height / 2) * .9
		resize_buttons.buttons.b0001.img_hover = _img(img_folder + 'Midimode_sel.png')
		//resize_buttons.buttons.b0001.tiptext = 'MIDI'

		resize_buttons.buttons.b0002.x = window.Width - window.Height / 2
		resize_buttons.buttons.b0002.y = window.Height / 2
		resize_buttons.buttons.b0002.w = (window.Height / 2) * .9
		resize_buttons.buttons.b0002.h = (window.Height / 2) * .9
		resize_buttons.buttons.b0002.img_hover = _img(img_folder + 'Maximode_sel.png')
		//resize_buttons.buttons.b0002.tiptext = 'MAXI'

		g_uihacks.SetPseudoCaption(0, 0, window.Width - window.Height / 2, window.Height)
	}
}


function on_mouse_lbtn_up(x, y, mask) {
	resize_buttons.lbtn_up(x, y, mask);
}

function on_mouse_leave() {
	resize_buttons.leave();
	// re-enable sizing on button-leave
	g_uihacks.EnableSizing(true)
}


function on_mouse_move(x, y) {
	// disable sizing while close-button is in focus
	_.forEach(resize_buttons.buttons, (item, i) => {
		if (item.trace(x, y)) {
			g_uihacks.DisableSizing(true);
		}
	});
	resize_buttons.move(x, y);
}
