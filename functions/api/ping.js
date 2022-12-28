const ping = async (req, res) => {
    console.log("Ping function");
    //console.log(req);
  
    try {
      console.log("Teste Danillo: ",Date());
      return res.status(200).json({ status: "OK" });
    } catch (e) {
      console.log(e);
      return res.status(500);
    }
  };
  
  module.exports = ping;