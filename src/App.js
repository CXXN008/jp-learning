import React from 'react'

const HOST = window.location.origin
const FILENAME = ['top8k', 'top2w', 'top5w', 'top18w']
const ZIPPATH = [
	`/${FILENAME[0]}.j`,
	`/${FILENAME[1]}.j`,
	`/${FILENAME[2]}.j`,
	`/${FILENAME[3]}.j`,
]
const JSONPATH = [
	`/${FILENAME[0]}.json`,
	`/${FILENAME[1]}.json`,
	`/${FILENAME[2]}.json`,
	`/${FILENAME[3]}.json`,
]
const MODE = [
	'hiragana single',
	'katakana single',
	'kanji single',
	'hiragana multi',
	'katakana multi',
	'kanji multi',
	'hiragana + katakana',
	'hiragana + kanji',
	'katakana + kanji',
	'other',
]
export default class App extends React.Component {
	componentDidMount() {
		// ui fix
		// document
		// 	.querySelectorAll('input[type="checkbox"]')
		// 	.forEach((e) => (e.checked = true))
		// string debug override
		// const f = console.log
		// console.log = (s) => {
		// 	this.setState({ infoText: s })
		// 	f(s)
		// }
		// console.log(document.querySelector(''))
	}

	componentDidUpdate() {}

	constructor(props) {
		super(props)
		this.termBlock = 100
		this.it = 0
		this.data = []
		this._typeCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

		this.state = {
			// show / hide
			// [hiragana,katakana,kanji]
			offset: 0,
			showWholeTypeCount: true,
			infoText: 'idle',
			viewLevel: 1,
			sliderHint: this.termBlock * 1,
			selectOption: 'default',
			typeCount: this._typeCount,
			wholeFileTypeCount: this._typeCount,
			checkedSelection: [
				true,
				true,
				true,
				true,
				true,
				true,
				true,
				true,
				true,
				true,
			],
			currentFrameUrl: `${process.env.PUBLIC_URL}dvd.html`,
			dataReady: false,
			loading: false,
			jdata: [],
		}
	}

	rtest() {
		// this.setState({infoText:this.state.checkedSelection})
	}

	handleCheck(e) {
		this.setState({ infoText: 'rendering doms' })

		window.requestAnimationFrame(() => {
			this.setState({ infoText: 'toggled ' + MODE[e.target.id] })

			this.setState(
				(s) =>
					(s.checkedSelection[e.target.id] =
						!s.checkedSelection[e.target.id])
			)
		})
	}

	typeDetector(term) {
		// type :
		// 0 => hiragana single
		// 1 => katakana single
		// 2 => kanji single
		// 3 => hiragana multi
		// 4 => katakana multi
		// 5 => kanji multi
		// 6 => hiragana + katakana
		// 7 => hiragana + kanji
		// 8 => katakana + kanji
		// 9 => other
		let type = 9
		if (term.length === 1) {
			if (/[ぁ-ん]/.test(term)) {
				type = 0
			} else if (/[ァ-ン]/.test(term)) {
				type = 1
			} else if (/[\u4e00-\u9faf]/.test(term)) {
				type = 2
			}
		} else {
			if (/^[ぁ-ん]{1,20}$/.test(term)) {
				type = 3
			} else if (/^[ァ-ン]{1,20}$/.test(term)) {
				type = 4
			} else if (/^[\u4e00-\u9faf]{1,20}$/.test(term)) {
				type = 5
			} else if (/^[ぁ-んァ-ン]{1,20}$/.test(term)) {
				type = 6
			} else if (/^[ぁ-ん\u4e00-\u9faf]{1,20}$/.test(term)) {
				type = 7
			} else if (/^[ァ-ン\u4e00-\u9faf]{1,20}$/.test(term)) {
				type = 8
			}
		}

		return type
	}
	// direct eval js object
	loadJS() {
		this.setState({
			loading: true,
			offset: 0,
			infoText: 'resetting values',
		})
		this.setState({ infoText: 'fetching data...' })

		const that = this
		fetch(`${HOST}${ZIPPATH[this.selectRef.value]}`)
			.then((response) => {
				if (response.status === 200 || response.status === 0) {
					this.setState({ infoText: 'http status ok ...' })
					this.setState({ infoText: 'decompressing ...' })

					return Promise.resolve(response.blob())
				} else {
					this.setState({ infoText: 'network error ...' })

					return Promise.reject(new Error(response.statusText))
				}
			})
			.then(window.JSZip.loadAsync)
			.then((zip) => {
				this.setState({ infoText: 'loading file to string ...' })
				return zip.file(FILENAME[this.selectRef.value]).async('text')
			})
			.then(
				function success(text) {
					// eslint-disable-next-line
					that.data = eval(text)
					that.setState({
						infoText: 'evaled object ...',
						loading: false,
						dataReady: true,
						viewLevel: that.sliderRef.value,
						jdata: that.data.slice(
							that.state.offset,
							that.state.offset +
								that.state.viewLevel * that.termBlock
						),
					})
					that.calcTotalTypeCount()
				},
				function error(e) {
					console.log(e)
					that.setState({ infoText: 'compressing error' })
				}
			)
	}

	calcTotalTypeCount() {
		let temp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
		this.data.forEach((d) => {
			temp[d[3]]++
		})
		this.setState({ wholeFileTypeCount: temp })
	}

	// org json
	loadJson() {
		this.setState({ loading: true, offset: 0 })

		this.setState({ infoText: 'fetching data...' })
		fetch(`${HOST}/${JSONPATH[this.selectRef.value]}`).then((response) => {
			this.setState({ infoText: 'download completed.' })
			// setTimeout(() => {

			this.setState({ infoText: 'parsing data...' })
			response.json().then((d) => {
				this.setState({ infoText: 'parsing completed...' })
				this.setState({ infoText: 'compressing...' })
				const compressedData = d.map((v, _id) => {
					const term = v[0]
					const reading =
						undefined === v[2].reading ? '' : v[2].reading
					const freq =
						undefined === v[2].value
							? v[2].frequency.value
							: v[2].value
					// [term,reading,freq,type]
					return [term, reading, freq, this.typeDetector(term), _id]
				})
				this.data = compressedData
				this.setState({ infoText: 'compression completed...' })
				this.setState({
					loading: false,
					dataReady: true,
					viewLevel: this.sliderRef.value,
					jdata: this.data.slice(
						this.state.offset,
						this.state.offset +
							this.state.viewLevel * this.termBlock
					),
				})
				// window.requestAnimationFrame(() => {
				// 	this.setState({ typeCount: this._typeCount })
				// })
				this.setState({
					infoText:
						this.selectRef.selectedOptions[0].innerText +
						' loaded to mem',
				})
			})
			// }, 0)
		})
	}
	test() {
		// this.setState({infoText:this.state.typeCount, 'slz'})
	}

	// getReading(item) {
	// 	return undefined === item[2].value
	// 		? item[2].frequency.value
	// 		: item[2].value
	// }

	getReading(item) {
		return '' === item[1] ? item[0] : item[1]
	}

	sameAsPrev(v, i, a) {
		if (i === 0) {
			return false
		}
		return a[i - 1][2] === v[2]
	}

	qJPDB = (e) => {
		const val = e.currentTarget.querySelector('h2').innerText
		this.setState(
			(state) =>
				(state.currentFrameUrl = 'https://jpdb.io/search?q=' + val)
		)
	}

	getList = () => {
		this._typeCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

		try {
			const r = this.state.jdata.map((v, i, a) => {
				const reading = this.getReading(v)
				const hasReading = !(reading === '')
				const sameAsPrev = this.sameAsPrev(v, i, a)
				const freq = v[2]
				const type = v[3]

				this._typeCount[type]++

				return this.state.checkedSelection[type] ? (
					<div
						key={i}
						className={`card shadow cursor-crosshair  transition duration-75 ease-in-out hover:bg-purple-200 transform hover:-translate-y-1 active:translate-y-1   ${
							sameAsPrev
								? '  animate-fadeShallow bg-blue-50'
								: 'animate-fadeDeep bg-blue-100'
						}`}
						onClick={this.qJPDB.bind(this)}
					>
						<span className="absolute top-1 left-1 text-xs text-gray-400">
							id:{v[4]}
						</span>
						<div className="card-body">
							{`${
								hasReading
									? (sameAsPrev ? '<- / ' : '') +
									  freq +
									  ' / ' +
									  reading
									: freq
							}`}

							<h2 className="card-title self-center ">{v[0]}</h2>
						</div>
					</div>
				) : (
					''
				)
			})
			window.requestAnimationFrame(() => {
				this.setState({ typeCount: this._typeCount })
			})
			return r
		} catch (error) {
			this.setState({ infoText: error })
			return 'parse error'
		}
	}

	handleSlide(value) {
		// this.setState({
		// 	viewLevel: value,
		// })
		this.setState((s) => {
			s.viewLevel = value
			s.infoText = 'rendering doms...'
			s.sliderHint = this.state.viewLevel * this.termBlock
			return s
		})
		window.requestAnimationFrame(() => {
			this.setState((s) => {
				s.jdata = this.data.slice(
					this.state.offset,
					this.state.offset + this.state.viewLevel * this.termBlock
				)
				s.infoText = 'rendering finished'

				return s
			})
		})
	}

	handleSelect(e) {
		this.setState({
			selectOption: e.target.value,
			infoText: `current selected url:${HOST}/${
				ZIPPATH[this.selectRef.value]
			}`,
		})
	}

	offsetInputHandle(e) {
		const valid = /^[0-9\b]+$/
		let offset = e.target.value

		if (offset === '') {
			offset = 0
		}

		if (valid.test(offset)) {
			try {
				offset = parseInt(offset)
				if (offset > this.data.length) {
					offset = this.data.length
				}
			} catch (e) {
				this.setState({ infoText: 'math error' })
			}
			this.setState({ infoText: 'offset ' + offset + ' applied' })

			window.requestAnimationFrame(() => {
				this.setState({
					offset: offset,
				})
				window.requestAnimationFrame(() => {
					this.setState({
						jdata: this.data.slice(
							this.state.offset,
							this.state.offset +
								this.state.viewLevel * this.termBlock
						),
					})
				})
			})
		}
	}

	handleSwitch(e) {
		this.setState({ showWholeTypeCount: e.target.checked })
	}
	render() {
		return (
			<div className="text-center justify-center">
				<header className="text-3xl w-full fixed z-10 bg-base-100  h-14  drop-shadow-md flex">
					<div className=" justify-center self-center top-0 flex">
						{/* urlinput */}

						<select
							className="select select-sm select-info h-fit self-center input input-bordered input-primary max-w-xs ml-4"
							ref={(selectRef) => (this.selectRef = selectRef)}
							value={this.state.selectOption}
							onChange={this.handleSelect.bind(this)}
						>
							<option disabled value="default">
								選擇詞典庫
							</option>
							<option value="0">Top9k5</option>
							<option value="1">Top2w3</option>
							<option value="2">Top5w8</option>
							<option value="3">Top51w</option>
						</select>
						{/* <input
							type="text"
							ref={(zipUrl) => (this.zipUrl = zipUrl)}
							// defaultValue="https://github.com/MarvNC/jpdb-freq-list/releases/download/2022-05-09/Freq.JPDB_2022-05-10T03_27_02.930Z.zip"
							// defaultValue="https://www.baidu.com"
							defaultValue="http://127.0.0.1:3000/top2w.json"
							// defaultValue="https://example.com/"
							className="h-fit self-center input input-bordered input-primary w-1/4 max-w-xs "
						/> */}
						{/* buttons */}
						<button
							className={`btn normal-case btn-sm self-center btn-primary ml-4 ${
								this.state.loading ||
								this.state.selectOption === 'default'
									? 'btn-disabled'
									: ''
							} ${this.state.loading ? 'loading' : ''}`}
							onClick={this.loadJS.bind(this)}
						>
							load json
						</button>
						{/* <input
							type="text"
							placeholder="Start"
							ref={(startIndex) => (this.startIndex = startIndex)}
							className="input input-sm self-center input-bordered input-secondary  w-16 mx-1"
						/> */}

						{/* 
				<div className="form-control justify-center w-1/2">
							<div className="btn-group input-group-sm w-full justify-center ">
					
									<button className="btn btn-square btn-sm btn-primary w-14">
									上500个
								</button>
								<button className="btn btn-square btn-sm btn-primary w-14">
									下500个
								</button>
							</div>
						</div> */}
						<span className="text-sm self-center whitespace-nowrap ml-4">
							偏移：
						</span>
						<input
							type="text"
							onChange={this.offsetInputHandle.bind(this)}
							placeholder="起始量"
							value={this.state.offset}
							className="input input-sm input-bordered p-0 w-14 self-center text-center"
						/>
						<div
							className="tooltip tooltip-bottom self-center  flex justify-center "
							data-tip={this.state.sliderHint}
						>
							<span className="text-sm w-20 self-center whitespace-nowrap ml-4">
								頁面容量：
							</span>
							<input
								type="range"
								id={'handleSlide' + 1}
								min="0"
								value={this.state.viewLevel}
								// onAnimationEnd={this.slideEnd()}
								onChange={(e) =>
									this.handleSlide(e.target.value)
								}
								max="10"
								ref={(sliderRef) =>
									(this.sliderRef = sliderRef)
								}
								className="range range-primary range-xs justify-center w-full self-center "
							/>
						</div>
						<span className="text-xs self-center mx-2 whitespace-nowrap text-cyan-600">
							{this.state.offset} ~{' '}
							{this.state.offset +
								this.termBlock * this.state.viewLevel}{' '}
							of {this.data.length}
						</span>
					</div>

					{/* checkboxes */}
					{/*  0 => hiragana single
						 1 => katakana single
						 2 => kanji single
						 3 => hiragana multi
						 4 => katakana multi
						 5 => kanji multi
						 6 => hiragana + katakana
						 7 => hiragana + kanji
						 8 => katakana + kanji
						 9 => other */}
					<div className="btn-group justify-start ml-4">
						<button
							onClick={this.handleCheck.bind(this)}
							id={0}
							className={`btn btn-md self-center ${
								this.state.checkedSelection[0]
									? 'btn-active'
									: ''
							}  btn-ghost`}
						>
							平單
							<br />
							{this.state.typeCount[0]}
							<br />
							{this.state.showWholeTypeCount
								? this.state.wholeFileTypeCount[0]
								: ''}
						</button>
						<button
							onClick={this.handleCheck.bind(this)}
							id={1}
							className={`btn btn-md self-center ${
								this.state.checkedSelection[1]
									? 'btn-active'
									: ''
							}  btn-ghost`}
						>
							片單
							<br />
							{this.state.typeCount[1]}
							<br />
							{this.state.showWholeTypeCount
								? this.state.wholeFileTypeCount[1]
								: ''}
						</button>
						<button
							onClick={this.handleCheck.bind(this)}
							id={2}
							className={`btn btn-md self-center ${
								this.state.checkedSelection[2]
									? 'btn-active'
									: ''
							}  btn-ghost`}
						>
							漢單
							<br />
							{this.state.typeCount[2]}
							<br />
							{this.state.showWholeTypeCount
								? this.state.wholeFileTypeCount[2]
								: ''}
						</button>

						<button
							onClick={this.handleCheck.bind(this)}
							id={3}
							className={`btn btn-md self-center ${
								this.state.checkedSelection[3]
									? 'btn-active'
									: ''
							}  btn-ghost`}
						>
							平多
							<br />
							{this.state.typeCount[3]}
							<br />
							{this.state.showWholeTypeCount
								? this.state.wholeFileTypeCount[3]
								: ''}
						</button>

						<button
							onClick={this.handleCheck.bind(this)}
							id={4}
							className={`btn btn-md self-center ${
								this.state.checkedSelection[4]
									? 'btn-active'
									: ''
							}  btn-ghost`}
						>
							片多
							<br />
							{this.state.typeCount[4]}
							<br />
							{this.state.showWholeTypeCount
								? this.state.wholeFileTypeCount[4]
								: ''}
						</button>

						<button
							onClick={this.handleCheck.bind(this)}
							id={5}
							className={`btn btn-md self-center ${
								this.state.checkedSelection[5]
									? 'btn-active'
									: ''
							}  btn-ghost`}
						>
							漢多
							<br />
							{this.state.typeCount[5]}
							<br />
							{this.state.showWholeTypeCount
								? this.state.wholeFileTypeCount[5]
								: ''}
						</button>

						<button
							onClick={this.handleCheck.bind(this)}
							id={6}
							className={`btn btn-md self-center ${
								this.state.checkedSelection[6]
									? 'btn-active'
									: ''
							}  btn-ghost`}
						>
							平+片
							<br />
							{this.state.typeCount[6]}
							<br />
							{this.state.showWholeTypeCount
								? this.state.wholeFileTypeCount[6]
								: ''}
						</button>

						<button
							onClick={this.handleCheck.bind(this)}
							id={7}
							className={`btn btn-md self-center ${
								this.state.checkedSelection[7]
									? 'btn-active'
									: ''
							}  btn-ghost`}
						>
							平+漢
							<br />
							{this.state.typeCount[7]}
							<br />
							{this.state.showWholeTypeCount
								? this.state.wholeFileTypeCount[7]
								: ''}
						</button>

						<button
							onClick={this.handleCheck.bind(this)}
							id={8}
							className={`btn btn-md self-center ${
								this.state.checkedSelection[8]
									? 'btn-active'
									: ''
							}  btn-ghost`}
						>
							片+漢
							<br />
							{this.state.typeCount[8]}
							<br />
							{this.state.showWholeTypeCount
								? this.state.wholeFileTypeCount[8]
								: ''}
						</button>

						<button
							onClick={this.handleCheck.bind(this)}
							id={9}
							className={`btn btn-md self-center ${
								this.state.checkedSelection[9]
									? 'btn-active'
									: ''
							}  btn-ghost`}
						>
							未分類
							<br />
							{this.state.typeCount[9]}
							<br />
							{this.state.showWholeTypeCount
								? this.state.wholeFileTypeCount[9]
								: ''}
						</button>
					</div>
					<div className="form-control absolute justify-center self-center right-0">
						<label className="label cursor-pointer">
							<span className="label-text">顯示整體分佈</span>
							<input
								type="checkbox"
								className="toggle toggle-primary"
								defaultChecked={this.state.showWholeTypeCount}
								onChange={this.handleSwitch.bind(this)}
							/>
						</label>
					</div>
					<span className="self-center text-sm  absolute top-0 z-0 right-0  text-green-400 bg-black px-1">
						{this.state.infoText}
					</span>
				</header>

				<div className="grid grid-cols-2 h-screen">
					<div className="flex flex-wrap gap-4 mt-14 overflow-auto sticky center">
						{!this.state.dataReady ? (
							<div className="justify-center w-full h-full">
								<div className="hero min-h-screen bg-base-200">
									<div className="hero-content text-center">
										<div className="max-w-md">
											<h1 className="text-5xl font-bold">
												jpdb top 50w
											</h1>
											<p className="py-6">
												左上角下拉框選擇一個數據源 =&gt;
												load json 即可加載列表
												<br />
												<br />
												<b>其他説明</b>
												<br />
												偏移：瞬移到指定索引開始 &nbsp;
												頁面容量：頁面同時加載div個數
												&nbsp; 平單：單個平假名
												片單：單個片假名 漢單：單個漢字
												以此類推
												<br />
												顯示整體分佈：打開/關閉整個文件的單詞類型顯示
												<br />
												<br />
												如果右邊顯示無法加載，請至Chrome商店下載"
												<b>Ignore X-Frame headers</b>
												"或同類功能插件以解除封印。
												<br />
												<br />
												<b>someLinks</b>
											</p>
											<button
												className="btn btn-md btn-primary normal-case"
												onClick={() => {
													window.open(
														'https://chrome.google.com/webstore/gleekbfjekiniecknbkamfmkohkpodhe'
													)
												}}
											>
												Chrome
											</button>
											<button
												className="btn btn-md btn-secondary mx-3 normal-case"
												onClick={() => {
													window.open(
														'https://addons.mozilla.org/en-US/firefox/addon/ignore-x-frame-options-header/'
													)
												}}
											>
												Firefox
											</button>
											<button
												className="btn btn-md btn-accent normal-case"
												onClick={() => {
													window.open(
														'https://www.crxsoso.com/webstore/detail/gleekbfjekiniecknbkamfmkohkpodhe'
													)
												}}
											>
												墻内鏡像
											</button>
											<div className="flex self-center justify-center my-4">
												<img
													src={
														process.env.PUBLIC_URL +
														'github.png'
													}
													className="w-8"
												/>

												<button
													className="btn btn-sm self-center"
													onClick={() => {
														window.open(
															'https://github.com/cccccccccccccccccccccccccccccccccccccc/jp-learning'
														)
													}}
												>
													源碼
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						) : (
							''
						)}
						{this.getList()}
					</div>

					<iframe
						title="jpdb"
						className="w-1/2 right-0 fixed shadow-lg"
						width="100%"
						height="100%"
						frameBorder="0"
						allowtransparency="true"
						src={this.state.currentFrameUrl}
					/>
				</div>
			</div>
		)
	}
}
