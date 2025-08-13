#!/usr/bin/env python3
"""
测试配置热插拔功能的脚本
"""

import os
from dotenv import load_dotenv, set_key
from config_manager import config_manager

def test_hot_reload():
    """测试配置热插拔功能"""
    print("=== 配置热插拔功能测试 ===")
    
    # 获取当前配置
    print("\n1. 获取当前配置:")
    config = config_manager.get_all_config()
    print(f"当前 AI_MAX_TOKENS: {config.AI_MAX_TOKENS}")
    print(f"当前 AI_PROVIDER: {config.AI_PROVIDER}")
    print(f"当前 AI_OUTPUT_LANGUAGE: {config.AI_OUTPUT_LANGUAGE}")
    
    # 测试 AI 客户端获取
    print("\n2. 测试 AI 客户端获取:")
    try:
        from ai_service import get_current_ai_client, get_all_ai_config
        ai_config = get_all_ai_config()
        print(f"AI 配置获取成功: {ai_config['AI_PROVIDER']}")
        
        client = get_current_ai_client()
        if client:
            print(f"AI 客户端获取成功: {type(client).__name__}")
        else:
            print("AI 客户端为 None (可能是配置问题)")
    except Exception as e:
        print(f"AI 客户端测试失败: {e}")
    
    # 测试配置修改和热重载
    print("\n3. 测试配置热重载:")
    dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
    
    # 保存原始值
    original_tokens = config.AI_MAX_TOKENS
    
    try:
        # 修改配置
        new_tokens = 5000
        set_key(dotenv_path, 'AI_MAX_TOKENS', str(new_tokens))
        print(f"已修改 .env 文件中的 AI_MAX_TOKENS 为: {new_tokens}")
        
        # 重新加载配置
        load_dotenv(dotenv_path, override=True)
        config_manager.reload_config()
        print("已调用 config_manager.reload_config()")
        
        # 验证配置是否更新
        updated_config = config_manager.get_all_config()
        print(f"重载后的 AI_MAX_TOKENS: {updated_config.AI_MAX_TOKENS}")
        
        if updated_config.AI_MAX_TOKENS == new_tokens:
            print("✅ 配置热重载成功!")
        else:
            print("❌ 配置热重载失败!")
            
        # 测试 AI 服务是否也更新了
        try:
            from ai_service import get_all_ai_config
            ai_config_after = get_all_ai_config()
            print(f"AI 服务中的 AI_MAX_TOKENS: {ai_config_after['AI_MAX_TOKENS']}")
            if ai_config_after['AI_MAX_TOKENS'] == new_tokens:
                print("✅ AI 服务配置也已更新!")
            else:
                print("❌ AI 服务配置未更新!")
        except Exception as e:
            print(f"AI 服务配置检查失败: {e}")
            
    finally:
        # 恢复原始配置
        set_key(dotenv_path, 'AI_MAX_TOKENS', str(original_tokens))
        load_dotenv(dotenv_path, override=True)
        config_manager.reload_config()
        print(f"\n已恢复原始配置 AI_MAX_TOKENS: {original_tokens}")
    
    print("\n=== 测试完成 ===")

if __name__ == "__main__":
    test_hot_reload()