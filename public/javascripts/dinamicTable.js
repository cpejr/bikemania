  (function($) {
    remove = function(item) {
      var tr = $(item).closest('tr');
  
      tr.fadeOut(400, function() {
        tr.remove();  
      });
  
      return false;
    }
  })(jQuery);

  (function($) {
    AddTableRow = function() {
  
      var newRow = $("<tr>");
      var cols = "";
  
      cols += '<td>&nbsp;<div class="col-lg-8"><div class="cadastro mt-1"><div class="texto-centro"><select class="drowdownoptions form-control" name="rent[equipamentName]" required = "required"><option value disabled selected> Tipo</option><option value="Bicicleta com marcha aro 26">Bicicleta com marcha aro 26</option><option value="Bicicleta com marcha aro 29">Bicicleta com marcha aro 29</option><option value="Bicicleta Freeride">Bicicleta Freeride</option><option value="Bicicleta Chopper">Bicicleta Chopper</option><option value="Bicicleta Dupla">Bicicleta Dupla</option><option value="Bicicleta Comum">Bicicleta Comum</option><option value="Bicicleta Tripla">Bicicleta Tripla</option><option value="Bicicleta Triciclo Família">Bicicleta Triciclo Família</option><option value="Triciclo Trenzinho">Triciclo Trenzinho</option><option value="Triciclo">Triciclo</option><option value="Moto Elétrica">Moto Elétrica</option><option value="Skate">Skate</option><option value="Bola">Bola</option><option value="Corda">Corda</option><option value="Frescobol">Frescobol</option><option value="Kangoo Jump">Kangoo Jump</option><option value="Drift Tracker">Drift Tracker</option><option value="Patinete">Patinete</option><option value="Patins">Patins</option><option value="Capacete">Capacete</option><option value="Kit de Segurança">Kit de Segurança</option></select></div></div></div></td>';
      cols += '<td>&nbsp;<div class="col-lg-4"><div class="cadastro mt-1"><div class="texto-centro"><input type="number" class="form-control" name="rent[quantity]" min="1" value="1" required = "required"></div></div></div></td>';
      cols += '<td><div class="col-lg-8"><div class="cadastro mt-4"><div class="texto-centro"><button class="btn btn-default" onclick="remove(this)" type="button" aria-hidden="true"><img src="/images/minus.png" width="30px" height"30px"> </button></div></div></div></td>';
  
      newRow.append(cols);
      $("#details-table").append(newRow);
  
      return false;
    };
  })(jQuery);