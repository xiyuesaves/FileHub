<template>
	<div class="mask">
		<div class="center-content">
			<div class="login-box">
				<span class="login-field">用户名</span>
				<input type="text" name="">
				<span class="login-field">密码</span>
				<input type="password" name="">
			</div>
		</div>
	</div>
</template>
<script>
	
</script>
<style scoped>
	.mask{
		position: fixed;
		z-index: 999;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		background-color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.center-content{
		width: 340px;
		height: 350px;
		padding: 16px;
		box-sizing: border-box;
	}
	.login-box{
		width: 100%;
		height: 300px;
		border-radius: 8px;
		border: solid 1px #d8dee4;
		background-color: #f6f8fa;
		padding: 20px;
		box-sizing: border-box;
		display: flex;
		align-items: flex-start;
		justify-content: flex-start;
		flex-direction: column;
	}
</style>