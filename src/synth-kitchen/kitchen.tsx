import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { Home } from './pages/home';
import { FourOhFour } from './pages/four-oh-four';
import { PatchEditor } from './pages/patch-editor';
import { Test } from './pages/test';

export const Kitchen: React.FunctionComponent = () => {
	return (
		<BrowserRouter>
			<Switch>
				<Route path="/" exact>
					<Home />
				</Route>
				<Route path="/patch" component={PatchEditor} />
				<Route path="/patch/:id" component={PatchEditor} />
				<Route path="/test" component={Test} />
				<Route path="">
					<FourOhFour />
				</Route>
			</Switch>
		</BrowserRouter>
	);
};
