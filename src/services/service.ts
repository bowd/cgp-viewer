export abstract class SingleLoaderService<Response> {
	responseCache: Response | null = null;
	isLoading: boolean = false;
	promise: Promise<Response> | null = null;

	loadSuspense(): Response {
		if (this.responseCache) {
			return this.responseCache;
		}
		if (this.isLoading) {
			throw this.promise!;
		}

		this.promise = new Promise<Response>(async (resolve, reject) => {
			try {
				const response = await this.handleLoad();
				this.responseCache = response;
				resolve(response);
			} catch (e) {
				reject(e);
			} finally {
				this.isLoading = false;
				this.promise = null;
			}
		});
		this.isLoading = true;

		throw this.promise!;
	}

	async load(): Promise<Response> {
		try {
			return this.loadSuspense();
		} catch (promise) {
			return promise as Promise<Response>;
		}
	}

	abstract handleLoad(): Promise<Response>;
}

export abstract class CollectionLoaderService<Key, Response> {
	responseCache: Map<Key, Response> = new Map();
	isLoading: Set<Key> = new Set();
	promises: Map<Key, Promise<Response>> = new Map();

	loadSuspense(key: Key): Response {
		if (this.responseCache.has(key)) {
			return this.responseCache.get(key)!;
		}
		if (this.isLoading.has(key)) {
			throw this.promises.get(key)!;
		}

		const promise = new Promise<Response>(async (resolve, reject) => {
			try {
				const response = await this.handleLoad(key);
				this.responseCache.set(key, response);
				resolve(response);
			} catch (e) {
				reject(e);
			} finally {
				this.promises.delete(key);
				this.isLoading.delete(key);
			}
		});

		this.promises.set(key, promise);
		this.isLoading.add(key);

		throw promise;
	}

	async load(key: Key): Promise<Response> {
		try {
			return this.loadSuspense(key);
		} catch (promise) {
			return promise as Promise<Response>;
		}
	}

	abstract handleLoad(key: Key): Promise<Response>;
}
