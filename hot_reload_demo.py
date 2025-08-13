#!/usr/bin/env python3
"""
配置热插拔功能演示脚本

这个脚本演示了如何在不重启后端服务的情况下动态更新配置。
"""

import os
from dotenv import set_key, load_dotenv
from config_manager import config_manager
from ai_service import get_all_ai_config, get_current_ai_client

def demo_hot_reload():
    """演示配置热插拔功能"""
    print("🔥 配置热插拔功能演示")
    print("=" * 50)
    
    # 显示当前配置
    print("\n📋 当前配置:")
    config = config_manager.get_all_config()
    ai_config = get_all_ai_config()
    
    print(f"  AI Provider: {ai_config['AI_PROVIDER']}")
    print(f"  AI Max Tokens: {ai_config['AI_MAX_TOKENS']}")
    print(f"  AI Temperature: {ai_config['AI_TEMPERATURE']}")
    print(f"  Output Language: {ai_config['AI_OUTPUT_LANGUAGE']}")
    
    # 显示当前 AI 客户端
    client = get_current_ai_client()
    if client:
        print(f"  当前 AI 客户端: {type(client).__name__}")
    
    print("\n🔄 演示配置热重载...")
    
    # 模拟配置更改
    dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
    original_temp = ai_config['AI_TEMPERATURE']
    new_temp = 0.8
    
    try:
        # 1. 修改 .env 文件
        print(f"\n1️⃣ 修改配置文件 (.env)")
        print(f"   将 AI_TEMPERATURE 从 {original_temp} 改为 {new_temp}")
        set_key(dotenv_path, 'AI_TEMPERATURE', str(new_temp))
        
        # 2. 重新加载环境变量
        print("\n2️⃣ 重新加载环境变量")
        load_dotenv(dotenv_path, override=True)
        
        # 3. 调用配置管理器的热重载
        print("\n3️⃣ 触发配置热重载")
        config_manager.reload_config()
        
        # 4. 验证配置已更新
        print("\n4️⃣ 验证配置更新")
        updated_ai_config = get_all_ai_config()
        
        if updated_ai_config['AI_TEMPERATURE'] == new_temp:
            print(f"   ✅ 配置已成功更新: AI_TEMPERATURE = {updated_ai_config['AI_TEMPERATURE']}")
            print("   🎉 热插拔成功！无需重启后端服务")
        else:
            print(f"   ❌ 配置更新失败")
            
        # 5. 验证 AI 客户端也已更新
        updated_client = get_current_ai_client()
        if updated_client:
            print(f"   ✅ AI 客户端保持可用: {type(updated_client).__name__}")
            
    finally:
        # 恢复原始配置
        print("\n🔄 恢复原始配置...")
        set_key(dotenv_path, 'AI_TEMPERATURE', str(original_temp))
        load_dotenv(dotenv_path, override=True)
        config_manager.reload_config()
        print(f"   ✅ 已恢复 AI_TEMPERATURE = {original_temp}")
    
    print("\n" + "=" * 50)
    print("🎯 演示完成！")
    print("\n💡 使用说明:")
    print("   1. 修改 .env 文件中的配置")
    print("   2. 调用 API: POST /api/config (会自动触发热重载)")
    print("   3. 或者直接调用: config_manager.reload_config()")
    print("   4. 配置立即生效，无需重启服务！")

if __name__ == "__main__":
    demo_hot_reload()