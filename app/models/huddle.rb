class Huddle
  include Mongoid::Document

  embeds_many :nominations
end
