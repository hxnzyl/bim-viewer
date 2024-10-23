/** @type {import('next').NextConfig} */

const nextConfig = {
	output: 'export',
	// 关闭严格模式
	reactStrictMode: false,
	// 路径末尾加/
	trailingSlash: true,
	transpilePackages: ['lucide-react'],
	webpack(config) {
		config.module.rules.push({
			test: /\.(glsl|vs|fs|vert|frag)$/,
			use: ['raw-loader', 'glslify-loader']
		})
		return config
	}
}

export default nextConfig
