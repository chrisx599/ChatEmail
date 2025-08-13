#!/usr/bin/env python3
"""
测试 API 层面的配置热插拔功能
"""

import os
import time
from dotenv import load_dotenv, set_key
from config_manager import config_manager
from email_client import EmailClient

def test_api_hot_reload():
    """测试 API 层面的配置热插拔"""
    
    print("=== API 配置热插拔测试 ===")
    
    # 1. 显示当前配置
    print("\n1. 当前配置:")
    current_limit = config_manager.get('FETCH_LIMIT', 10)
    print(f"   FETCH_LIMIT: {current_limit}")
    
    # 2. 创建 EmailClient 实例并检查其使用的配置
    print("\n2. 创建 EmailClient 实例:")
    client = EmailClient()
    print(f"   EmailClient 将使用的 FETCH_LIMIT: {config_manager.get('FETCH_LIMIT', 10)}")
    
    # 3. 模拟修改 .env 文件
    print("\n3. 修改 .env 文件中的 FETCH_LIMIT...")
    dotenv_path = '.env'
    original_limit = os.getenv('FETCH_LIMIT', '10')
    new_limit = '25'
    
    # 修改 .env 文件
    set_key(dotenv_path, 'FETCH_LIMIT', new_limit)
    print(f"   已将 FETCH_LIMIT 从 {original_limit} 修改为 {new_limit}")
    
    # 4. 重新加载环境变量和配置
    print("\n4. 重新加载配置...")
    load_dotenv(dotenv_path, override=True)
    config_manager.reload_config()
    
    # 5. 验证配置是否更新
    print("\n5. 验证配置更新:")
    updated_limit = config_manager.get('FETCH_LIMIT', 10)
    print(f"   更新后的 FETCH_LIMIT: {updated_limit}")
    
    # 6. 创建新的 EmailClient 实例并验证
    print("\n6. 创建新的 EmailClient 实例:")
    new_client = EmailClient()
    print(f"   新 EmailClient 将使用的 FETCH_LIMIT: {config_manager.get('FETCH_LIMIT', 10)}")
    
    # 7. 验证热插拔是否成功
    if str(updated_limit) == new_limit:
        print("\n✅ 配置热插拔测试成功！")
        print(f"   FETCH_LIMIT 已成功从 {original_limit} 更新为 {updated_limit}")
    else:
        print("\n❌ 配置热插拔测试失败！")
        print(f"   期望: {new_limit}, 实际: {updated_limit}")
    
    # 8. 恢复原始配置
    print("\n8. 恢复原始配置...")
    set_key(dotenv_path, 'FETCH_LIMIT', original_limit)
    load_dotenv(dotenv_path, override=True)
    config_manager.reload_config()
    
    restored_limit = config_manager.get('FETCH_LIMIT', 10)
    print(f"   已恢复 FETCH_LIMIT 为: {restored_limit}")
    
    print("\n=== 测试完成 ===")

if __name__ == "__main__":
    test_api_hot_reload()