Pod::Spec.new do |s|
  s.name = 'IronMuscleHealth'
  s.version = '1.0.0'
  s.summary = 'Iron Muscle health bridge'
  s.license = 'UNLICENSED'
  s.homepage = 'https://github.com/iamminseongKim/iron-muscle'
  s.author = 'Iron Muscle'
  s.source = { :git => 'https://github.com/iamminseongKim/iron-muscle.git' }
  s.source_files = 'ios/Plugin/**/*.{swift,h,m}'
  s.ios.deployment_target = '13.0'
  s.dependency 'Capacitor'
  s.frameworks = 'HealthKit'
  s.swift_version = '5.1'
end
