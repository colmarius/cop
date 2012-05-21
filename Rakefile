require 'rubygems'

HEADER = /((^\s*\/\/.*\n)+)/

desc "rebuild the cop-min.js files for distribution"
task :build do
  begin
    require 'closure-compiler'
  rescue LoadError
    puts "closure-compiler not found.\nInstall it by running 'gem install closure-compiler"
    exit
  end
  source = File.read 'cop.js'
  header = source.match(HEADER)
  File.open('cop-min.js', 'w+') do |file|
    file.write header[1].squeeze(' ') + Closure::Compiler.new.compress(source)
  end
end

desc "build the docco documentation"
task :doc do
  check 'docco', 'docco', 'https://github.com/jashkenas/docco'
  system 'docco cop.js'
end

desc "run JavaScriptLint on the source"
task :lint do
  system "jsl --nofilelisting --nologo --conf docs/jsl.conf cop.js"
end

# Check for the existence of an executable.
def check(exec, name, url)
  return unless `which #{exec}`.empty?
  puts "#{name} not found.\nInstall it from #{url}"
  exit
end
