





import { ProcessorRepository } from './request_processing/RequestProcessor';
import { serverRequest, authData} from '../types/02_serv_t';
import { v4 as uuid } from 'uuid';


const serverPort = 8700;

export class UserModule {

	private static instance: UserModule;

	private req_proc: ProcessorRepository;
	
	private auth_try_num: number = 4;
	private auth: boolean = false;
	private user_id: number = -1;

	private constructor() {
		this.req_proc = ProcessorRepository.getInstance();
	}

	public static getInstance(): UserModule {
		if (!UserModule.instance) {
			UserModule.instance = new UserModule();
		}

		return UserModule.instance;
	}

	private _pass_gen() {
		// random int from 48 to 55
		let int_value = Math.floor(Math.random() * (55 - 48 + 1) + 48);
		let password = 'pulsary' + int_value + '.';
		console.log("generated password: ", password)
		return password
	}

	// internals
	public askForAuth() {
		let auth = new authData();
		auth.password = this._pass_gen()
		

		let on_finish = (authData: authData) => {
			this._setIsAuthenticated(authData.auth);
			this.user_id = authData.user_id;

			if (!authData.auth && this.auth_try_num > 0) {
				setTimeout(() => this.askForAuth(), 500);
				this.auth_try_num--;
			}
		}

		let unique_id = uuid()
		this.req_proc.get_processor('auth')
			?.bind_fn(on_finish, unique_id)
			.to_server(auth, unique_id)
	}

	// to communicate with react
	public isAuthenticated = () => {
		return this.auth;
	};

	public getUserId = () => {
		return this.user_id;
	}

	private isAuthenticatedSetter: (suth: boolean) => void = () => { };

	public setAuthenticatedSetter = (setter: (suth: boolean) => void) => {
		this.isAuthenticatedSetter = setter;
	}

	private _setIsAuthenticated = (isAuthenticated: boolean) => {
		this.auth = isAuthenticated;
		this.isAuthenticatedSetter(isAuthenticated);
	}

}

